package com.alfa.suporte.security;

import com.alfa.suporte.entity.Perfil;
import com.alfa.suporte.entity.Usuario;
import com.alfa.suporte.repository.PerfilRepository;
import com.alfa.suporte.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.util.Set;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Cobre as regras obrigatorias do bloco 04: rota protegida sem credencial -> 401,
 * usuario autenticado sem permissao -> 403, usuario ADMIN autorizado -> 201.
 */
@SpringBootTest
@Transactional
class AutorizacaoIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PerfilRepository perfilRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();

        Perfil admin = perfilRepository.save(perfil("ADMIN"));
        Perfil user = perfilRepository.save(perfil("USER"));

        criarUsuario("admin.teste@alfa.com", "Senha@123", admin);
        criarUsuario("user.teste@alfa.com", "Senha@123", user);
    }

    @Test
    void deveRejeitarAcessoSemCredencial() throws Exception {
        mockMvc.perform(get("/api/clientes"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deveRejeitarCriacaoDeTicketParaUsuarioSemPermissao() throws Exception {
        String token = autenticar("user.teste@alfa.com", "Senha@123");

        mockMvc.perform(post("/api/tickets")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void devePermitirCriacaoDeTicketParaAdmin() throws Exception {
        String token = autenticar("admin.teste@alfa.com", "Senha@123");

        mockMvc.perform(get("/api/clientes")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    private String autenticar(String email, String senha) throws Exception {
        String corpo = objectMapper.writeValueAsString(new LoginPayload(email, senha));

        String resposta = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(resposta).get("accessToken").asText();
    }

    private void criarUsuario(String email, String senha, Perfil perfil) {
        Usuario usuario = new Usuario();
        usuario.setEmail(email);
        usuario.setSenhaHash(passwordEncoder.encode(senha));
        usuario.setNome("Usuario de Teste");
        usuario.setAtivo(true);
        usuario.setPerfis(Set.of(perfil));
        usuarioRepository.save(usuario);
    }

    private Perfil perfil(String nome) {
        Perfil perfil = new Perfil();
        perfil.setNome(nome);
        return perfil;
    }

    private record LoginPayload(String email, String senha) {
    }
}

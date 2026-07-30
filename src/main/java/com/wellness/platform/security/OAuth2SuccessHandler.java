package com.wellness.platform.security;

import com.wellness.platform.entity.AuthProvider;
import com.wellness.platform.entity.Role;
import com.wellness.platform.entity.User;
import com.wellness.platform.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    public OAuth2SuccessHandler(JwtTokenProvider tokenProvider, UserRepository userRepository) {
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setName(name != null ? name : "Google User");
                    newUser.setPassword(UUID.randomUUID().toString());
                    newUser.setRole(Role.USER);
                    newUser.setProvider(AuthProvider.GOOGLE);
                    newUser.setAvatarUrl(picture);
                    return userRepository.save(newUser);
                });

        String token = tokenProvider.generateTokenFromUser(user.getId(), user.getEmail(), user.getName(), user.getRole().name());

        String targetUrl = "http://localhost:5173/login?token=" + token;
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}

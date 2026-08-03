package com.aiskin.backend.service;

import com.aiskin.backend.dto.AuthResponse;
import com.aiskin.backend.dto.LoginRequest;
import com.aiskin.backend.dto.RegisterRequest;
import com.aiskin.backend.entity.Provider;
import com.aiskin.backend.entity.Role;
import com.aiskin.backend.entity.User;
import com.aiskin.backend.repository.UserRepository;
import com.aiskin.backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // Register User
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse("User already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        user.setProvider(Provider.LOCAL);

        userRepository.save(user);

        return new AuthResponse("User registered successfully");
    }

    // Login User
    public AuthResponse login(LoginRequest request) {

        System.out.println("========== LOGIN ==========");
        System.out.println("Email Entered : " + request.getEmail());

        Optional<User> optionalUser =
                userRepository.findByEmail(request.getEmail());

        if (optionalUser.isEmpty()) {
            System.out.println("USER NOT FOUND");
            return new AuthResponse("Invalid email or password");
        }

        User user = optionalUser.get();

        System.out.println("Database Email : " + user.getEmail());
        System.out.println("Entered Password : " + request.getPassword());
        System.out.println("Stored Password Hash : " + user.getPassword());

        boolean passwordMatches =
                passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                );

        System.out.println("Password Matches : " + passwordMatches);

        if (!passwordMatches) {
            return new AuthResponse("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail());

        System.out.println("JWT Generated Successfully");

        return new AuthResponse("Login successful", token);
    }
}
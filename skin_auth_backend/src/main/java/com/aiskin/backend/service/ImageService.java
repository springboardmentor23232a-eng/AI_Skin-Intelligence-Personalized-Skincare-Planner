package com.aiskin.backend.service;

import com.aiskin.backend.dto.ImageUploadResponse;
import com.aiskin.backend.entity.SkinImage;
import com.aiskin.backend.entity.User;
import com.aiskin.backend.repository.SkinImageRepository;
import com.aiskin.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@Service
public class ImageService {

    private final SkinImageRepository skinImageRepository;
    private final UserRepository userRepository;

    public ImageService(SkinImageRepository skinImageRepository,
                        UserRepository userRepository) {
        this.skinImageRepository = skinImageRepository;
        this.userRepository = userRepository;
    }

    public ImageUploadResponse uploadImage(MultipartFile file, String email)
            throws IOException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Project folder
        String projectPath = System.getProperty("user.dir");

        File uploadDir = new File(projectPath, "uploads");

        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        String fileName = System.currentTimeMillis() + "_"
                + file.getOriginalFilename();

        File destination = new File(uploadDir, fileName);

        file.transferTo(destination);

        SkinImage image = new SkinImage();
        image.setFileName(fileName);
        image.setFilePath(destination.getAbsolutePath());
        image.setUser(user);

        skinImageRepository.save(image);

        return new ImageUploadResponse(
                "Image uploaded successfully",
                fileName
        );
    }
}
package com.aiskin.backend.controller;

import com.aiskin.backend.dto.ImageUploadResponse;
import com.aiskin.backend.service.ImageService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/image")
public class ImageController {

    private final ImageService imageService;

    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    @PostMapping("/upload")
    public ImageUploadResponse uploadImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws Exception {

        return imageService.uploadImage(file, authentication.getName());
    }
}
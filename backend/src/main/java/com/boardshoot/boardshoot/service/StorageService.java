package com.boardshoot.boardshoot.service;

import com.boardshoot.boardshoot.config.SupabaseStorageConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.UUID;

@Service
public class StorageService {

    private static final Logger logger = LoggerFactory.getLogger(StorageService.class);

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private SupabaseStorageConfig supabaseConfig;

    /**
     * Salvestab pildi data URL formaadis, et vältida Supabase API-ga seotud probleeme
     */
    public String uploadImage(byte[] imageData, Long noteId) {
        try {
            // Esmalt proovime pildi otse Supabase Storage'isse üles laadida
            String fileName = "note_" + noteId + "_" + UUID.randomUUID().toString() + ".jpg";
            String uploadUrl = uploadToSupabaseStorage(imageData, fileName);
            
            if (uploadUrl != null) {
                logger.info("Successfully uploaded image to Supabase Storage: {}", uploadUrl);
                return uploadUrl;
            }
            
            // Varuvariandina kasutame base64 data URL
            logger.info("Falling back to data URL method for image storage");
            
            // Teisendame binaar-pildi base64 kujule
            String base64Image = Base64.getEncoder().encodeToString(imageData);
            
            // Tagastame data URL, mida saab otse HTML img tag-is kasutada
            String dataUrl = "data:image/jpeg;base64," + base64Image;
            logger.info("Successfully converted image to data URL (length: {})", dataUrl.length());
            
            return dataUrl;
        } catch (Exception e) {
            logger.error("Error processing image for note {}: {}", noteId, e.getMessage(), e);
            throw new RuntimeException("Failed to process image: " + e.getMessage());
        }
    }
    
    /**
     * Laadib pildi üles kasutades Supabase Storage S3-kompatiibelset API-d
     */
    private String uploadToSupabaseStorage(byte[] imageData, String fileName) {
        try {
            // Kontrollime ja loome vajadusel bucketi
            checkAndCreateBucket();
            
            // Supabase S3 ühilduv endpoint
            String uploadUrl = "https://ctbfkxypwclmeugswemb.supabase.co/storage/v1/object/" + supabaseConfig.getBucketName() + "/" + fileName;
            logger.debug("Uploading image to Supabase Storage S3 endpoint: {}", uploadUrl);
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("apikey", supabaseConfig.getSupabaseServiceKey());
            headers.set("Authorization", "Bearer " + supabaseConfig.getSupabaseServiceKey());
            headers.setContentType(MediaType.IMAGE_JPEG);
            
            HttpEntity<byte[]> requestEntity = new HttpEntity<>(imageData, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                uploadUrl,
                HttpMethod.POST,
                requestEntity,
                String.class
            );
            
            if (response.getStatusCode().is2xxSuccessful()) {
                // Tagastame avaliku URL-i
                String publicUrl = supabaseConfig.getSupabaseUrl() + "/storage/v1/object/public/" + 
                                 supabaseConfig.getBucketName() + "/" + fileName;
                logger.info("Successfully uploaded image to Supabase Storage: {}", publicUrl);
                return publicUrl;
            } else {
                logger.error("Failed to upload image to Supabase Storage: {}", response.getBody());
                return null;
            }
        } catch (Exception e) {
            logger.error("Error uploading image to Supabase Storage: {}", e.getMessage(), e);
            return null; // Varuvariant käivitub
        }
    }

    /**
     * Üritab RPC meetodi kaudu faili üles laadida
     */
    private String uploadFileRPC(byte[] imageData, String fileName) {
        try {
            String rpcUrl = supabaseConfig.getSupabaseUrl() + "/rest/v1/rpc/upload_image";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("apikey", supabaseConfig.getSupabaseServiceKey());
            headers.set("Authorization", "Bearer " + supabaseConfig.getSupabaseServiceKey());
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // Teeme Base64 kodeeritud pildi stringi nagu SQL funktsioon seda eeldab
            String base64Image = java.util.Base64.getEncoder().encodeToString(imageData);
            
            String requestBody = String.format(
                "{\"bucket_name\":\"%s\", \"file_name\":\"%s\", \"file_data\":\"%s\"}",
                supabaseConfig.getBucketName(),
                fileName,
                base64Image
            );
            
            HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                rpcUrl,
                HttpMethod.POST,
                requestEntity,
                String.class
            );
            
            if (response.getStatusCode().is2xxSuccessful()) {
                String publicUrl = String.format("%s/storage/v1/object/public/%s/%s", 
                    supabaseConfig.getSupabaseUrl(), 
                    supabaseConfig.getBucketName(), 
                    fileName);
                logger.info("Successfully uploaded image via RPC to: {}", publicUrl);
                return publicUrl;
            } else {
                logger.error("RPC upload failed: {}", response.getBody());
                throw new RuntimeException("RPC upload failed");
            }
        } catch (Exception e) {
            logger.error("Error in RPC upload: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Kontrollib, kas bucket eksisteerib, kui mitte, siis loob selle
     */
    private void checkAndCreateBucket() {
        try {
            // URL bucketi kontrollimiseks
            String bucketUrl = String.format("%s/bucket/%s", 
                supabaseConfig.getStorageUrl(), 
                supabaseConfig.getBucketName());
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("apikey", supabaseConfig.getSupabaseServiceKey());
            headers.set("Authorization", "Bearer " + supabaseConfig.getSupabaseServiceKey());
            
            HttpEntity<String> requestEntity = new HttpEntity<>(headers);
            
            // Proovime bucketi infot pärida
            ResponseEntity<String> response = restTemplate.exchange(
                bucketUrl, 
                HttpMethod.GET, 
                requestEntity, 
                String.class
            );
            
            // Kui bucket on olemas, siis logime selle
            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("Bucket '{}' already exists", supabaseConfig.getBucketName());
                return;
            }
        } catch (Exception e) {
            logger.warn("Bucket '{}' check failed: {}", supabaseConfig.getBucketName(), e.getMessage());
            // Kui päring ebaõnnestus, siis proovime bucketi luua
        }
        
        // Loome uue bucketi
        try {
            String createBucketUrl = supabaseConfig.getStorageUrl() + "/bucket";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("apikey", supabaseConfig.getSupabaseServiceKey());
            headers.set("Authorization", "Bearer " + supabaseConfig.getSupabaseServiceKey());
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            String requestBody = String.format("{\"name\":\"%s\",\"public\":true}", 
                supabaseConfig.getBucketName());
            
            HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                createBucketUrl, 
                HttpMethod.POST, 
                requestEntity, 
                String.class
            );
            
            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("Successfully created bucket '{}'", supabaseConfig.getBucketName());
            } else {
                logger.error("Failed to create bucket: {}", response.getBody());
            }
        } catch (Exception e) {
            logger.error("Error creating bucket: {}", e.getMessage());
        }
    }
} 
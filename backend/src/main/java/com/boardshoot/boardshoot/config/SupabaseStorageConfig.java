package com.boardshoot.boardshoot.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class SupabaseStorageConfig {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;
    
    @Value("${supabase.service-key:${supabase.key}}")
    private String supabaseServiceKey;
    
    @Value("${supabase.storage.bucket}")
    private String bucketName;

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
    
    public String getSupabaseUrl() {
        return supabaseUrl;
    }
    
    public String getSupabaseKey() {
        return supabaseKey;
    }
    
    /**
     * Tagastab service_role võtme, mis annab täisõigused Supabase'i ressurssidele
     * Kui service võtit pole määratud, tagastab tavalise võtme
     */
    public String getSupabaseServiceKey() {
        return supabaseServiceKey;
    }
    
    public String getBucketName() {
        return bucketName;
    }
    
    /**
     * Tagastab Storage API baasaadressi
     */
    public String getStorageUrl() {
        return supabaseUrl + "/storage/v1";
    }
} 
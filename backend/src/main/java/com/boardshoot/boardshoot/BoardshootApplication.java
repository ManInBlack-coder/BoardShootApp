package com.boardshoot.boardshoot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BoardshootApplication {

	public static void main(String[] args) {
		SpringApplication.run(BoardshootApplication.class, args);
		System.out.println("Server is running on port 8080");
	}

}

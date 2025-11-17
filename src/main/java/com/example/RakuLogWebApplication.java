package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RakuLogWebApplication {

	public static void main(String[] args) {
		SpringApplication.run(RakuLogWebApplication.class, args);
	}
}

package com.hutech.DoAnJ2EE;

import com.hutech.DoAnJ2EE.service.GameService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class DoAnJ2EeApplication {

	public static void main(String[] args) {
		SpringApplication.run(DoAnJ2EeApplication.class, args);
	}

	@Bean
	public CommandLineRunner initData(GameService gameService) {
		return args -> {
			gameService.initializeGames();
		};
	}
}

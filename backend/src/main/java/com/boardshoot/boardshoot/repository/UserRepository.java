package com.boardshoot.boardshoot.repository;

import com.boardshoot.boardshoot.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {}

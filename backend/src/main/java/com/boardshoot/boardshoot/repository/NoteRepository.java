package com.boardshoot.boardshoot.repository;

import com.boardshoot.boardshoot.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoteRepository extends JpaRepository<Note, Long> {}

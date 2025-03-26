package com.boardshoot.boardshoot.repository;

import com.boardshoot.boardshoot.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByFolderId(Long folderId);
}

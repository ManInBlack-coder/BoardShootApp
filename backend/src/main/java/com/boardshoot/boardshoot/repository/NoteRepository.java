package com.boardshoot.boardshoot.repository;

import com.boardshoot.boardshoot.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByFolderId(Long folderId);
    Optional<Note> findByFolderIdAndId(Long folderId, Long noteId);
    List<Note> findByUserId(Long userId);
}
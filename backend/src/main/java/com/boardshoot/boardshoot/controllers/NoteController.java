package com.boardshoot.boardshoot.controller;

import com.boardshoot.boardshoot.model.Note;
import com.boardshoot.boardshoot.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notes")
public class NoteController {
    @Autowired
    private NoteRepository noteRepository;

    @PostMapping
    public Note createNote(@RequestBody Note note) {
        return noteRepository.save(note);
    }

    @GetMapping
    public List<Note> getNotes() {
        return noteRepository.findAll();
    }
}

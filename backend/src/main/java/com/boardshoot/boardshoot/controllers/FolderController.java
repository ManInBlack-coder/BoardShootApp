package com.boardshoot.boardshoot.controller;

import com.boardshoot.boardshoot.model.Folder;
import com.boardshoot.boardshoot.repository.FolderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/folders")
public class FolderController {
    @Autowired
    private FolderRepository folderRepository;

    @PostMapping
    public Folder createFolder(@RequestBody Folder folder) {
        return folderRepository.save(folder);
    }

    @GetMapping
    public List<Folder> getFolders() {
        return folderRepository.findAll();
    }
}

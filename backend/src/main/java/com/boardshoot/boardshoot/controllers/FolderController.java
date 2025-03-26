package com.boardshoot.boardshoot.controller;

import com.boardshoot.boardshoot.model.Folder;
import com.boardshoot.boardshoot.model.User;
import com.boardshoot.boardshoot.repository.FolderRepository;
import com.boardshoot.boardshoot.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/folders")
public class FolderController {

    @Autowired
    private FolderRepository folderRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/{userId}")
    public Folder createFolder(@PathVariable Long userId, @RequestBody Folder folder) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isPresent()) {
            folder.setUser(user.get());
            return folderRepository.save(folder);
        }
        throw new RuntimeException("User not found");
    }

    @GetMapping("/{userId}")
    public List<Folder> getFoldersByUser(@PathVariable Long userId) {
        return folderRepository.findByUserId(userId);
    }
}

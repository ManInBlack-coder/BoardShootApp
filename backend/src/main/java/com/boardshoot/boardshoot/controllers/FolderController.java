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
@RequestMapping("/users/{userId}/folders")
public class FolderController {

    @Autowired
    private FolderRepository folderRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public Folder createFolder(@PathVariable Long userId, @RequestBody Folder folder) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isPresent()) {
            folder.setUser(user.get());
            return folderRepository.save(folder);
        }
        throw new RuntimeException("User not found");
    }

    @GetMapping
    public List<Folder> getFoldersByUser(@PathVariable Long userId) {
        return folderRepository.findByUserId(userId);
    }
    @GetMapping("/name/{folderName}")
    public Folder getFolderByUserAndName(@PathVariable Long userId, @PathVariable String folderName) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (!userOptional.isPresent()) {
            throw new RuntimeException("User not found");
        }
        Optional<Folder> folder = folderRepository.findByUserAndName(userOptional.get(), folderName);
        if (folder.isPresent()) {
            return folder.get();
        }
        throw new RuntimeException("Folder not found");
    }

    @GetMapping("/{folderId}")
    public Folder getFolderByUserAndId(@PathVariable Long userId, @PathVariable Long folderId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (!userOptional.isPresent()) {
            throw new RuntimeException("User not found");
        }
        Optional<Folder> folder = folderRepository.findByUserIdAndId(userId, folderId);
        if (folder.isPresent()) {
            return folder.get();
        }
        throw new RuntimeException("Folder not found");
    }

     @PutMapping("/{folderId}")
    public Folder updateFolder(
        @PathVariable Long userId, 
        @PathVariable Long folderId, 
        @RequestBody Folder updatedFolder
    ) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (!userOptional.isPresent()) {
            throw new RuntimeException("User not found");
        }
        
        Optional<Folder> existingFolderOptional = folderRepository.findByUserIdAndId(userId, folderId);
        if (existingFolderOptional.isPresent()) {
            Folder existingFolder = existingFolderOptional.get();
            existingFolder.setName(updatedFolder.getName());

            return folderRepository.save(existingFolder);
        }
        throw new RuntimeException("Folder not found");
    }

    @DeleteMapping("/{folderId}")
    public void deleteFolder(@PathVariable Long userId, @PathVariable Long folderId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (!userOptional.isPresent()) {
            throw new RuntimeException("User not found");
        }

        Optional<Folder> folder = folderRepository.findByUserIdAndId(userId, folderId);
        if (folder.isPresent()) {
            folderRepository.delete(folder.get());
        } else {
            throw new RuntimeException("Folder not found");
        }
    }
}

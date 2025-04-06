package com.boardshoot.boardshoot.repository;

import com.boardshoot.boardshoot.model.Folder;
import com.boardshoot.boardshoot.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FolderRepository extends JpaRepository<Folder, Long> {

    List<Folder> findByUserId(Long userId);

    Optional<Folder> findByUserAndName(User user, String name);

    Optional<Folder> findByUserIdAndId(Long userId, Long folderId);
}

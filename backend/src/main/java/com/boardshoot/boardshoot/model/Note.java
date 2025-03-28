package com.boardshoot.boardshoot.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.util.List;
import java.util.ArrayList;

@Entity
public class Note {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @ElementCollection
    @CollectionTable(name = "note_texts", joinColumns = @JoinColumn(name = "note_id"))
    @Column(name = "text")
    private List<String> texts = new ArrayList<>();

    @ElementCollection
    @Lob
    @CollectionTable(name = "note_images", joinColumns = @JoinColumn(name = "note_id"))
    @Column(name = "image")
    private List<byte[]> images = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "folder_id")
    @JsonManagedReference
    private Folder folder;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Note() {}

    public Note(String title, List<String> texts, List<byte[]> images, Folder folder, User user) {
        this.title = title;
        this.texts = texts;
        this.images = images;
        this.folder = folder;
        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<String> getTexts() {
        return texts;
    }

    public void setTexts(List<String> texts) {
        this.texts = texts;
    }

    public void addText(String text) {
        this.texts.add(text);
    }

    public List<byte[]> getImages() {
        return images;
    }

    public void setImages(List<byte[]> images) {
        this.images = images;
    }

    public void addImage(byte[] image) {
        this.images.add(image);
    }

    public Folder getFolder() {
        return folder;
    }

    public void setFolder(Folder folder) {
        this.folder = folder;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
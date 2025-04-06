package com.boardshoot.boardshoot.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "note")
public class Note {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    
    @ManyToOne
    @JoinColumn(name = "folder_id")
    private Folder folder;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ElementCollection
    @CollectionTable(
        name = "note_texts",
        joinColumns = @JoinColumn(name = "note_id")
    )
    @Column(name = "text")
    private List<String> texts = new ArrayList<>();
    
    @ElementCollection
    @CollectionTable(
        name = "note_images",
        joinColumns = @JoinColumn(name = "note_id")
    )
    @Lob // Märgime, et tegu on suure binaarse objektiga
    @Column(name = "image", columnDefinition = "bytea") // PostgreSQL-spetsiifiline tüübi määramine
    private List<byte[]> images = new ArrayList<>();
    
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
}
-- Muudame oid tüübi bytea tüübiks note_images tabelis
-- Kasutame teistsugust süntaksit teisendamiseks, kuna otsene teisendus ei tööta
ALTER TABLE note_images ALTER COLUMN image TYPE bytea USING image::text::bytea;

-- Veendume, et note_texts tabelil on nõutud seosed
ALTER TABLE note_texts ADD CONSTRAINT fk_note_texts_note 
  FOREIGN KEY (note_id) REFERENCES note(id) ON DELETE CASCADE;

-- Veendume, et note_images tabelil on nõutud seosed
ALTER TABLE note_images ADD CONSTRAINT fk_note_images_note 
  FOREIGN KEY (note_id) REFERENCES note(id) ON DELETE CASCADE;

-- Veendume, et note tabelil on nõutud seosed
ALTER TABLE note ADD CONSTRAINT fk_note_folder 
  FOREIGN KEY (folder_id) REFERENCES folder(id) ON DELETE SET NULL;
  
ALTER TABLE note ADD CONSTRAINT fk_note_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Veendume, et folder tabelil on nõutud seosed
ALTER TABLE folder ADD CONSTRAINT fk_folder_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL; 
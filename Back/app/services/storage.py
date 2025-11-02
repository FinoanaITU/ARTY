"""
Service de gestion du stockage des fichiers
"""
import os
import uuid
from typing import Optional
from fastapi import UploadFile
from app.core.config import settings
import aiofiles


class StorageService:
    """Service pour gérer le stockage des fichiers"""
    
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        self.max_file_size = settings.MAX_FILE_SIZE
        self.storage_type = settings.STORAGE_TYPE
    
    def _ensure_directory(self, folder_path: str):
        """Crée le répertoire s'il n'existe pas"""
        full_path = os.path.join(self.upload_dir, folder_path)
        os.makedirs(full_path, exist_ok=True)
        return full_path
    
    def _get_file_extension(self, filename: str) -> str:
        """Récupère l'extension du fichier"""
        return filename.split('.')[-1].lower() if '.' in filename else ''
    
    def _validate_file(self, file: UploadFile, allowed_extensions: list[str]) -> bool:
        """Valide le type de fichier"""
        extension = self._get_file_extension(file.filename)
        return extension in allowed_extensions
    
    async def upload_file(
        self,
        file: UploadFile,
        folder: str = "uploads",
        allowed_extensions: Optional[list[str]] = None,
        max_size: Optional[int] = None
    ) -> str:
        """
        Upload un fichier et retourne l'URL relative
        
        Args:
            file: Le fichier à uploader
            folder: Dossier de destination
            allowed_extensions: Extensions autorisées (par défaut: jpg, jpeg, png, webp)
            max_size: Taille maximale en bytes (par défaut: MAX_FILE_SIZE)
        
        Returns:
            URL relative du fichier (ex: "uploads/artisans/uuid.jpg")
        """
        if allowed_extensions is None:
            allowed_extensions = ["jpg", "jpeg", "png", "webp"]
        
        if max_size is None:
            max_size = self.max_file_size
        
        # Vérifier l'extension
        if not self._validate_file(file, allowed_extensions):
            raise ValueError(f"Extension non autorisée. Extensions valides: {', '.join(allowed_extensions)}")
        
        # Générer un nom unique
        file_extension = self._get_file_extension(file.filename)
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        
        # Créer le répertoire
        folder_path = self._ensure_directory(folder)
        
        # Chemin complet du fichier
        file_path = os.path.join(folder_path, unique_filename)
        
        # Lire et sauvegarder le fichier
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            
            # Vérifier la taille
            if len(content) > max_size:
                raise ValueError(f"Fichier trop volumineux. Taille max: {max_size / 1024 / 1024}MB")
            
            await f.write(content)
        
        # Retourner l'URL relative
        return f"{folder}/{unique_filename}"
    
    def delete_file(self, file_path: str) -> bool:
        """Supprime un fichier"""
        full_path = os.path.join(self.upload_dir, file_path)
        if os.path.exists(full_path):
            os.remove(full_path)
            return True
        return False

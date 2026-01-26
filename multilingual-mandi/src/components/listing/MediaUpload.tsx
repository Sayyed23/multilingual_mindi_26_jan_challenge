import React, { useRef } from 'react';

interface MediaUploadProps {
    files: File[];
    onUpload: (files: File[]) => void;
}

const MediaUpload: React.FC<MediaUploadProps> = ({ files, onUpload }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onUpload(Array.from(e.target.files));
        }
    };

    const handleBoxClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="form-card">
            <h3 className="card-heading">
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>image</span>
                Commodity Media
            </h3>

            <div className="upload-box" onClick={handleBoxClick}>
                <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--slate-400)', marginBottom: '8px' }}>cloud_upload</span>
                <p style={{ fontWeight: 500, margin: '0 0 4px 0' }}>Upload crop photos</p>
                <p style={{ fontSize: '12px', color: 'var(--slate-500)', margin: 0 }}>Drag and drop or click to browse. Max 5 images.</p>
                <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>

            <div className="photo-grid">
                {/* Mock Display of Pre-loaded or Uploaded Image */}
                <div className="photo-thumb" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAbdMC3vXDiUVaupDtaAiK6Vn-pCbHsQvv4H1RfjH3NQZlwbezKiwuEqVKafKTOFeB1oVCfWj6_Po2krml78DA_6suSNIFO8qwTEiUqvPxaxL3Notzg76geUvWleSuoF-berMAUAjsdWuRXO41T5j7v9Mx-aNAsWasCB_Z0nFMmvO2WCuvPov2jogZSX8U44SYhzuBhCXgVjBFB8yOPvNlZbRO5w-G_vCGfbcDPxDuK5gAwsi8EgSj8uIsoAy14lRqXh7nB0ZCy0Qp0')" }}>
                    <button style={{
                        position: 'absolute', top: '4px', right: '4px',
                        width: '20px', height: '20px', borderRadius: '50%',
                        backgroundColor: '#ef4444', color: 'white', border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>close</span>
                    </button>
                </div>

                {files.map((file, idx) => (
                    <div key={idx} className="photo-thumb" style={{ backgroundImage: `url(${URL.createObjectURL(file)})` }}></div>
                ))}

                <div className="photo-thumb add-thumb">
                    <span className="material-symbols-outlined">add</span>
                </div>
            </div>
        </div>
    );
};

export default MediaUpload;

import React from 'react';
import { X } from 'lucide-react';

interface VideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoUrl: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoUrl }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            {/* Outer glow ring */}
            <div className="relative w-full max-w-4xl">
                {/* Green ambient glow behind the modal */}
                <div className="absolute -inset-3 rounded-3xl bg-[#149403]/30 blur-xl pointer-events-none" />
                <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-br from-[#149403]/60 via-[#27C93F]/30 to-[#149403]/60 pointer-events-none" />

                {/* Modal card */}
                <div className="relative bg-[#111827] rounded-2xl shadow-2xl overflow-hidden border-2 border-[#149403]/70">
                    {/* Top accent bar */}
                    <div className="h-1 w-full bg-gradient-to-r from-[#149403] via-[#4ade80] to-[#149403]" />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all hover:scale-110"
                    >
                        <X className="w-5 h-5 text-gray-700" />
                    </button>

                    {/* YouTube Embed */}
                    <div className="aspect-video w-full">
                        <iframe
                            src={videoUrl}
                            title="GreenCRM Demo"
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoModal;
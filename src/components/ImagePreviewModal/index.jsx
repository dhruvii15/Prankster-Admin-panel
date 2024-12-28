import React, { useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const ImagePreviewModal = ({ show, onHide, images, currentIndex, onNavigate }) => {
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (!show) return;

            if (e.key === 'ArrowLeft') {
                onNavigate(currentIndex - 1);
            } else if (e.key === 'ArrowRight') {
                onNavigate(currentIndex + 1);
            } else if (e.key === 'Escape') {
                onHide();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [show, currentIndex, onNavigate, onHide]);

    if (!show || !images.length) return null;

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            className="image-preview-modal p-0"
            style={{ height: "100vh", width: "100vw" }}
        >
            {/* <Modal.Header className="border-0 p-2">
                <button
                    onClick={onHide} >
                    <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
                </button>
            </Modal.Header> */}
            <Modal.Body className="p-0 position-relative bg-transparent w-100 h-100">
                <div
                    className="d-flex align-items-center justify-content-center bg-transparent w-100 h-100"
                >
                    <img
                        src={images[currentIndex]}
                        alt="Preview"
                        className="img-fluid w-100 h-100"
                    />
                </div>


                {currentIndex > 0 && (
                    <button
                        onClick={() => onNavigate(currentIndex - 1)}
                        className="position-absolute start-0 top-50 translate-middle-y bg-white border-0 rounded-circle mx-2"
                        style={{
                            opacity: 0.8,
                            cursor: 'pointer',
                            transition: 'opacity 0.2s',
                            ':hover': { opacity: 1 }
                        }}
                    >
                        <FontAwesomeIcon icon={faChevronLeft} className="fs-6" />
                    </button>
                )}

                {currentIndex < images.length - 1 && (
                    <button
                        onClick={() => onNavigate(currentIndex + 1)}
                        className="position-absolute end-0 top-50 translate-middle-y bg-white border-0 rounded-circle mx-2"
                        style={{
                            opacity: 0.8,
                            cursor: 'pointer',
                            transition: 'opacity 0.2s',
                            ':hover': { opacity: 1 }
                        }}
                    >
                        <FontAwesomeIcon icon={faChevronRight} className="fs-6" />
                    </button>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default ImagePreviewModal;
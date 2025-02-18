import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table, Pagination, Col, Row, Spinner, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faToggleOn, faToggleOff, faArrowUpFromBracket, faArrowTrendUp, faArrowTrendDown, faChevronDown, faPlus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { faCopy, faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import ImagePreviewModal from 'components/ImagePreviewModal';

// img
import filter from "../../assets/images/filter.png"


const Audio = () => {

    const category = [
        { CategoryId: 1, CategoryName: 'Trending' },
        { CategoryId: 2, CategoryName: 'Nonveg' },
        { CategoryId: 3, CategoryName: 'Hot' },
        { CategoryId: 4, CategoryName: 'Funny' },
        { CategoryId: 5, CategoryName: 'Horror' },
        { CategoryId: 6, CategoryName: 'Celebrity' }
    ];

    const language = [
        { LanguageId: 1, LanguageName: 'Hindi' },
        { LanguageId: 2, LanguageName: 'English' },
        { LanguageId: 3, LanguageName: 'Marathi' },
        { LanguageId: 4, LanguageName: 'Gujarati' },
        { LanguageId: 5, LanguageName: 'Tamil' },
        { LanguageId: 6, LanguageName: 'Punjabi' }
    ];

    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [filteredData, setFilteredData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedImageFileName, setSelectedImageFileName] = useState('');
    const [selectedAudioFileName, setSelectedAudioFileName] = useState('');
    const [isOn, setIsOn] = useState(false);
    const [isSubmitting2, setIsSubmitting2] = useState(false);
    const [adminId, setAdminId] = useState(null);
    // const [safeFilter, setSafeFilter] = useState('');

    // New state for category and additional filters
    const [imageInputType, setImageInputType] = useState('file');
    const [audioInputType, setAudioInputType] = useState('file');
    const [imageUrlText, setImageUrlText] = useState('');
    const [audioUrlText, setAudioUrlText] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(0);
    const [activeTab2, setActiveTab2] = useState("Free");
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');


    const inputTypes = [
        { id: 'file', label: 'File Upload' },
        { id: 'text', label: 'URL' }
    ];

    const accessTypes = [
        { id: 'Free', label: 'Free' },
        { id: 'Premium', label: 'Premium' }
    ]

    const getCategoryName = (categoryId) => {
        const cat = category.find(c => c.CategoryId === parseInt(categoryId));
        return cat ? cat.CategoryName : categoryId;
    };

    const getLanguageName = (languageId) => {
        const lang = language.find(l => l.LanguageId === parseInt(languageId));
        return lang ? lang.LanguageName : languageId;
    };

    const getAdminData = () => {
        axios.get('https://pslink.world/api/admin/read')
            .then((res) => {
                setIsOn(res.data.data[0].AudioSafe);
                setAdminId(res.data.data[0]._id);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to fetch admin data.");
            });
    };

    const handleToggle = async () => {
        if (!isSubmitting2) {
            const newState = !isOn;
            try {
                setIsSubmitting2(true);
                setIsOn(newState);

                // Call the appropriate API based on the state
                const apiEndpoint = newState ? 'safe' : 'unsafe';
                const response = await axios.post(`https://pslink.world/api/${apiEndpoint}/${adminId}`, { type: "1" });

                // Reset to first page when toggling safe mode
                setCurrentPage(1);

                // Fetch updated data
                getData();
                getAdminData();

                toast.success(response.data.message);
            } catch (error) {
                console.error('Error updating safe status:', error);
                toast.error("Failed to update safe status.");
                setIsOn(!newState); // Revert to previous state on error
            } finally {
                setIsSubmitting2(false);
            }
        }
    };

    // Update the toggleModal function
    const toggleModal = (mode) => {
        if (!visible) {
            if (mode === 'add') {
                setId(undefined);
                setSelectedImageFileName('');
                setSelectedAudioFileName('');
                setImageUrlText('');
                setAudioUrlText('');
                setImageInputType('file');  // Reset input type to default
                setAudioInputType('file');  // Reset input type to default
                formik.resetForm();
                formik.setTouched({});
                Object.keys(formik.errors).forEach(key => {
                    formik.setFieldError(key, undefined);
                });
            }
        } else {
            formik.resetForm();
            setSelectedImageFileName('');
            setSelectedAudioFileName('');
            setImageUrlText('');
            setAudioUrlText('');
            setImageInputType('file');  // Reset input type to default
            setAudioInputType('file');  // Reset input type to default
            formik.setTouched({});
            Object.keys(formik.errors).forEach(key => {
                formik.setFieldError(key, undefined);
            });
        }
        setVisible(!visible);
    };

    const getData = () => {
        setLoading(true);
        axios.post('https://pslink.world/api/audio/read')
            .then((res) => {
                const newData = res.data.data;
                setData(newData);
                filterAudioData(newData);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    };


    useEffect(() => {
        getData();
        getAdminData();
    }, []);


    // const getFilteredCount = (options = {}) => {
    //     const {
    //         categoryId = null,
    //         languageId = null,
    //         languageTab = 'all'
    //     } = options;

    //     // Start with base filtering by safe/unsafe
    //     let filtered = data.filter(item => item.Safe === isOn);

    //     // Apply language filter
    //     if (languageTab !== 'all') {
    //         const selectedLanguage = language.find(cat => cat.LanguageName.toLowerCase() === languageTab);
    //         if (selectedLanguage) {
    //             filtered = filtered.filter(item => item.LanguageId === selectedLanguage.LanguageId);
    //         }
    //     }

    //     // Apply specific language filter if provided
    //     if (languageId) {
    //         filtered = filtered.filter(item => item.LanguageId === languageId);
    //     }

    //     // Apply language filter
    //     if (categoryId) {
    //         filtered = filtered.filter(item => item.CategoryId === parseInt(categoryId));
    //     }

    //     // Apply additional filters
    //     if (selectedCategoryFilter) {
    //         filtered = filtered.filter(item => item.CategoryId === parseInt(selectedCategoryFilter));
    //     }

    //     // Apply safe/unsafe filter
    //     // if (safeFilter) {
    //     //     filtered = filtered.filter(item => {
    //     //         if (safeFilter === 'Safe') return !item.Hide;
    //     //         if (safeFilter === 'Unsafe') return item.Hide;
    //     //         return true;
    //     //     });
    //     // }

    //     // Apply premium/free filter based on activeTab (Free or Premium)
    //     if (activeTab2 === "Premium") {
    //         filtered = filtered.filter(item => item.AudioPremium); // Only show premium items
    //     } else if (activeTab2 === "Free") {
    //         filtered = filtered.filter(item => !item.AudioPremium); // Only show free items
    //     }

    //     return filtered.length;
    // };

    const filterAudioData = () => {
        let filtered = data.filter(item => item.Safe === isOn);

        // Apply language filter
        if (selectedLanguage) {
            filtered = filtered.filter(item => item.LanguageId === parseInt(selectedLanguage));
        }

        // Apply category filter
        if (selectedCategory) {
            filtered = filtered.filter(item => item.CategoryId === parseInt(selectedCategory));
        }

        // Apply premium/free filter
        if (activeTab2 === "Premium") {
            filtered = filtered.filter(item => item.AudioPremium);
        } else if (activeTab2 === "Free") {
            filtered = filtered.filter(item => !item.AudioPremium);
        }

        setFilteredData(filtered);
    };

    // Handle language selection
    const handleLanguageChange = (value) => {
        setSelectedLanguage(value);
        setSelectedCategory(''); // Reset category when language changes
        setCurrentPage(1); // Reset to first page
    };

    // Handle category selection
    const handleCategoryChange = (value) => {
        setSelectedCategory(value);
        setCurrentPage(1); // Reset to first page
    };

    // Update useEffect to include new filters
    useEffect(() => {
        filterAudioData();
    }, [selectedLanguage, selectedCategory, data, isOn, activeTab2]);

    // Helper functions for dropdown display
    const getSelectedLanguageName = () => {
        if (!selectedLanguage) return 'Select Language';
        const lang = language.find(l => l.LanguageId === parseInt(selectedLanguage));
        return lang ? lang.LanguageName : 'Select Language';
    };

    const getSelectedCategoryName = () => {
        if (!selectedCategory) return 'Select Category';
        const cat = category.find(c => c.CategoryId === parseInt(selectedCategory));
        return cat ? cat.CategoryName : 'Select Category';
    };

    const audioSchema = Yup.object().shape({
        AudioName: Yup.string().required('Audio Prank Name is required'),
        Audio: Yup.mixed()
            .test('fileOrText', 'Either file upload or URL is required', function (value) {
                if (this.parent.isEditing && !value) return true;
                if (audioInputType === 'text') return !!audioUrlText;
                return value instanceof File;
            })
            .test('fileType', 'Invalid URL format . (ending with .mp3, .wav)', function (value) {
                if (audioInputType === 'text') {
                    const url = audioUrlText;
                    if (!url) return true;
                    const validAudioExtensions = ['.mp3', '.wav'];
                    return validAudioExtensions.some(ext => url.toLowerCase().endsWith(ext));
                }
                if (value instanceof File) {
                    const allowedTypes = ['audio/mpeg', 'audio/wav'];
                    return allowedTypes.includes(value.type);
                }
                return true;
            }),
        AudioImage: Yup.mixed()
            .test('fileOrText', 'Invalid URL format . (ending with .jpg, .jpeg, or .png)', function (value) {
                // If no image file or URL is provided, validation passes
                if (!value && !imageUrlText) return true;

                // If in text mode, check if URL is provided
                if (imageInputType === 'text') {
                    // If URL is empty, validation passes (optional field)
                    if (!imageUrlText) return true;
                    // If URL is provided, validate extension
                    const validImageExtensions = ['.jpg', '.jpeg', '.png'];
                    return validImageExtensions.some(ext =>
                        imageUrlText.toLowerCase().endsWith(ext)
                    );
                }

                // If in file mode, validate file type if a file is provided
                if (value instanceof File) {
                    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                    return allowedTypes.includes(value.type);
                }

                return true;
            }),
        AudioPremium: Yup.boolean(),
        CategoryId: Yup.string().required('Prank Category Name is required'),
        LanguageId: Yup.string().required('Prank Language is required'),
        Hide: Yup.boolean(),
        Safe: Yup.boolean(),
        isEditing: Yup.boolean()
    });


    const formik = useFormik({
        initialValues: {
            AudioName: '',
            ArtistName: '',
            Audio: '',
            AudioImage: '',
            AudioPremium: false,
            CategoryId: '',
            LanguageId: '',
            Hide: false,
            isEditing: false,
            Safe: false
        },
        validationSchema: audioSchema,
        validateOnMount: false,
        validateOnBlur: true,  // Enable validation on blur
        validateOnChange: true, // Enable validation on change
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                setIsSubmitting(true);
                const formData = new FormData();
                formData.append('AudioName', values.AudioName);
                formData.append('ArtistName', values.ArtistName);

                // Handle audio file/URL
                if (audioInputType === 'file' && values.Audio instanceof File) {
                    formData.append('Audio', values.Audio);
                } else if (audioInputType === 'text') {
                    formData.append('Audio', audioUrlText);
                }

                // Handle image file/URL
                if (imageInputType === 'file' && values.AudioImage instanceof File) {
                    formData.append('AudioImage', values.AudioImage);
                } else if (imageInputType === 'text') {
                    formData.append('AudioImage', imageUrlText);
                }

                formData.append('AudioPremium', values.AudioPremium);
                formData.append('CategoryId', values.CategoryId);
                formData.append('LanguageId', values.LanguageId);
                formData.append('Hide', values.isEditing ? !values.Safe : isOn ? !values.Safe : false);
                formData.append('Safe', values.Safe);
                formData.append('imageInputType', imageInputType);
                formData.append('audioInputType', audioInputType);

                const request = id !== undefined
                    ? axios.patch(`https://pslink.world/api/audio/update/${id}`, formData)
                    : axios.post('https://pslink.world/api/audio/create', formData);

                const res = await request;
                resetForm();
                setId(undefined);
                setSelectedImageFileName('');
                setSelectedAudioFileName('');
                setImageUrlText('');
                setAudioUrlText('');
                getData();
                toast.success(res.data.message);
                toggleModal('add');
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.message || "An error occurred");
            } finally {
                setIsSubmitting(false);
                setSubmitting(false);
            }
        },
    });

    const handleEdit = (audio) => {
        // Get filenames from URLs
        const imageFileName = audio.AudioImage.split('/').pop();
        const audioFileName = audio.Audio.split('/').pop();

        // Detect if current files are URLs
        const isImageUrl = audio.AudioImage.startsWith('http');
        const isAudioUrl = audio.Audio.startsWith('http');

        // Set input types for both fields
        setImageInputType(isImageUrl ? 'text' : 'file');
        setAudioInputType(isAudioUrl ? 'text' : 'file');

        // Set file names for display
        setSelectedImageFileName(imageFileName);
        setSelectedAudioFileName(audioFileName);

        // Set URL fields if applicable
        if (isImageUrl) {
            setImageUrlText(audio.AudioImage);
        } else {
            setImageUrlText('');
        }

        if (isAudioUrl) {
            setAudioUrlText(audio.Audio);
        } else {
            setAudioUrlText('');
        }

        // Set form values
        formik.setValues({
            AudioName: audio.AudioName,
            ArtistName: audio.ArtistName,
            Audio: '', // Reset file input
            AudioImage: '', // Reset file input
            AudioPremium: audio.AudioPremium,
            CategoryId: audio.CategoryId,
            LanguageId: audio.LanguageId,
            Hide: audio.Safe,
            Safe: audio.Safe,
            isEditing: true
        });
        setId(audio._id);

        toggleModal('edit');
    };

    const handleFileChange = async (event) => {
        const file = event.currentTarget.files[0];
        if (file) {
            try {
                // First compress the image
                const compressedFile = await compressImage(file);

                // Check file size after compression
                if (compressedFile.size > 5 * 1024 * 1024) { // 5MB in bytes
                    toast.error('Compressed file still exceeds 5MB limit');
                    return;
                }

                // Update Formik field and file state
                formik.setFieldValue("AudioImage", compressedFile);  // Change from CoverURL to AudioImage
                setSelectedImageFileName(compressedFile.name);
            } catch (error) {
                toast.error('Error processing image');
                console.error(error);
            }
        }
    };

    // Image compression function (same as previous implementation)
    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Reduce image quality and size
                    const maxWidth = 1920;
                    const maxHeight = 1080;
                    let width = img.width;
                    let height = img.height;

                    // Scale down if larger than max dimensions
                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width *= ratio;
                        height *= ratio;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to blob with reduced quality
                    canvas.toBlob((blob) => {
                        // Create a new file from the compressed blob
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });
                        resolve(compressedFile);
                    }, 'image/jpeg', 0.7); // 0.7 quality (70%)
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    const handlePremiumToggle = (audioId, currentPremiumStatus) => {
        axios.patch(`https://pslink.world/api/audio/update/${audioId}`, { AudioPremium: !currentPremiumStatus })
            .then((res) => {
                getData();
                toast.success(res.data.message);
            })
            .catch((err) => {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            });
    };

    const handleSafeToggle = (audioId, currentSafeStatus) => {
        axios.patch(`https://pslink.world/api/audio/update/${audioId}`, { Safe: !currentSafeStatus, Hide: currentSafeStatus })
            .then((res) => {
                getData();
                toast.success(res.data.message);
            })
            .catch((err) => {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            });
    };

    const handleDelete = (audioId) => {
        if (window.confirm("Are you sure you want to delete this Audio Prank?")) {
            axios.delete(`https://pslink.world/api/audio/delete/${audioId}`)
                .then((res) => {
                    getData();
                    toast.success(res.data.message);
                })
                .catch((err) => {
                    console.error(err);
                    toast.error("An error occurred. Please try again.");
                });
        }
    };

    // Pagination logic
        const [currentPage, setCurrentPage] = useState(1);
        const [itemsPerPage, setItemsPerPage] = useState(10);
        const itemsPerPageOptions = [10, 25, 50, 100];
    
        const handleItemsPerPageChange = (value) => {
            setItemsPerPage(value);
            setCurrentPage(1); // Reset to first page when changing items per page
        };
    
        // Calculate pagination values
        const totalItems = filteredData.length;
        const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalItems);
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
        const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
    
        // Handle page changes
        const paginate = (pageNumber) => {
            setCurrentPage(pageNumber);
        };
    
        // Render pagination controls
        const renderPaginationItems = () => {
            let items = [];
            const totalPagesToShow = 4;
    
            let startPage = Math.max(1, currentPage - Math.floor(totalPagesToShow / 2));
            let endPage = Math.min(totalPages, startPage + totalPagesToShow - 1);
    
            if (endPage - startPage < totalPagesToShow - 1) {
                startPage = Math.max(1, endPage - totalPagesToShow + 1);
            }
    
            for (let i = startPage; i <= endPage; i++) {
                items.push(
                    <Pagination.Item
                        key={i}
                        active={i === currentPage}
                        onClick={() => paginate(i)}
                    >
                        {i}
                    </Pagination.Item>
                );
            }
    
            return items;
        };

    const handleCopyToClipboard = (audio) => {
        navigator.clipboard.writeText(audio)
            .then(() => {
                toast.success("URL copied to clipboard!");
            })
            .catch(() => {
                alert("No URL to copy!");
            });
    };

    const handleShowPreview = (currentPageIndex) => {
        // Calculate the actual index in the full filtered dataset
        const actualIndex = (currentPage - 1) * itemsPerPage + currentPageIndex;
        setPreviewIndex(actualIndex);
        setShowPreview(true);
    };

    const handlePreviewNavigation = (newIndex) => {
        if (newIndex >= 0 && newIndex < filteredData.length) {
            setPreviewIndex(newIndex);
            // Calculate which page this image is on
            const newPage = Math.floor(newIndex / itemsPerPage) + 1;
            // Update the current page if necessary
            if (newPage !== currentPage) {
                setCurrentPage(newPage);
            }
        }
    };

    const isValidUrl = (url, type) => {
        try {
            new URL(url);

            if (type === 'image') {
                return /\.(jpg|jpeg|png)$/i.test(url);
            } else if (type === 'audio') {
                return /\.(mp3|wav)$/i.test(url);
            }

            return false;
        } catch (e) {
            return false;
        }
    };

    const renderFileInputSection = (type, formik) => {
        const isImage = type === 'image';
        const inputType = isImage ? imageInputType : audioInputType;
        const setInputType = isImage ? setImageInputType : setAudioInputType;
        const urlText = isImage ? imageUrlText : audioUrlText;
        const setUrlText = isImage ? setImageUrlText : setAudioUrlText;
        const fieldName = isImage ? 'AudioImage' : 'Audio';
        const label = isImage ? 'Audio Prank Image' : 'Audio Prank File';
        const fileSize = isImage ? '5 MB' : '3 MB';
        const required = !isImage;

        return (
            <Form.Group className="mb-3">
                <Form.Label className='fw-bold'>
                    {label} Type
                    {required && <span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>*</span>}
                </Form.Label>
                <div className="d-flex gap-3 mb-3">
                    {inputTypes.map((type) => (
                        <div
                            key={type.id}
                            onClick={() => !isSubmitting && setInputType(type.id)}
                            className={`cursor-pointer px-3 py-1 rounded-3 ${inputType === type.id ? 'bg-primary' : 'bg-light'}`}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    !isSubmitting && setPlatform(type.id);
                                }
                            }}
                            role="button"
                            tabIndex={0}
                            style={{
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                border: `1px solid ${inputType === type.id ? '' : '#dee2e6'}`,
                                userSelect: 'none' // Prevents text selection
                            }}
                        >
                            {type.label}
                        </div>
                    ))}
                </div>

                {inputType === 'file' ? (
                    <>
                        <Form.Label className='fw-bold'>
                            {label} <span style={{ fontSize: "12px" }}>({fileSize})</span>
                            {required && <span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>*</span>}
                        </Form.Label>
                        <div className="d-flex flex-column">
                            <Form.Control
                                type="file"
                                id={fieldName}
                                name={fieldName}
                                onChange={isImage ? handleFileChange : (event) => {
                                    const file = event.currentTarget.files[0];
                                    formik.setFieldValue(fieldName, file);
                                    if (file) {
                                        setSelectedAudioFileName(file.name);
                                    }
                                }}
                                onBlur={formik.handleBlur}
                                disabled={isSubmitting}
                                className="d-none"
                                accept={isImage ? "image/*" : "audio/*"}
                            />
                            <label htmlFor={fieldName} className="btn mb-2 p-4 bg-white w-100 rounded-2" style={{ border: "1px dotted #c1c1c1" }}>
                                <FontAwesomeIcon icon={faArrowUpFromBracket} style={{ fontSize: "15px" }} />
                                <div style={{ color: "#c1c1c1" }}>Select {label}</div>
                                <span style={{ fontSize: "0.8rem", color: "#5E95FE" }}>
                                    {isImage ? selectedImageFileName : selectedAudioFileName}
                                </span>
                            </label>
                        </div>
                    </>
                ) : (
                    <Form.Group>
                        <Form.Label className='fw-bold'>
                            {label} URL
                            {required && <span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>*</span>}
                        </Form.Label>
                        <Form.Control
                            type="text"
                            placeholder={`Enter ${label.toLowerCase()} URL`}
                            value={urlText}
                            onChange={(e) => {
                                const newUrl = e.target.value;
                                setUrlText(newUrl);

                                // Set field value for formik
                                formik.setFieldValue(fieldName, newUrl);

                                // Validate URL as user types
                                if (newUrl) {
                                    const isValid = isValidUrl(newUrl, isImage ? 'image' : 'audio');
                                    e.target.classList.remove('is-valid', 'is-invalid');
                                    e.target.classList.add(isValid ? 'is-valid' : 'is-invalid');
                                } else {
                                    e.target.classList.remove('is-valid', 'is-invalid');
                                }
                            }}
                            disabled={isSubmitting}
                        />
                    </Form.Group>
                )}

                {formik.touched[fieldName] && formik.errors[fieldName] && (
                    <div className="invalid-feedback d-block">
                        {formik.errors[fieldName]}
                    </div>
                )}
            </Form.Group>
        );
    };

    if (loading) return (
        <div
            style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: "hidden"
            }}
        >
            <div className="dots-loader">
                <span></span><span></span><span></span>
            </div>
        </div>
    );

    return (
        <div>
            <div className='d-sm-flex justify-content-between align-items-center'>
                <div>
                    <h4>Audio Prank</h4>
                </div>
                <div className='d-flex justify-content-between align-items-center gap-3'>
                    <Form className='d-flex align-items-center gap-4'>
                        <span className='fs-6 pt-1'>Safe : </span>
                        <Form.Check
                            type="switch"
                            id="custom-switch"
                            checked={isOn}
                            onChange={handleToggle}
                            className="custom-switch-lg"
                            style={{ transform: 'scale(1.5)' }}
                            disabled={isSubmitting2}
                        />
                    </Form>
                </div>
            </div>
           
            <div className='bg-white mt-3' style={{ borderRadius: "10px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
                <p className='fs-5 pt-4 px-4'>Search Filters</p>
                <div className='d-flex flex-wrap align-items-center justify-content-between pb-2 px-4'>
                    {/* Language Filter */}
                    <div className="d-flex align-items-center gap-2 my-2">
                        <Dropdown>
                            <Dropdown.Toggle
                                variant="light"
                                id="language-dropdown"
                                className="bg-white border rounded-2 d-flex align-items-center justify-content-between"
                                style={{ minWidth: "320px" }}
                                bsPrefix="d-flex align-items-center justify-content-between"
                            >
                                <div className="d-flex align-items-center">
                                    <img src={filter} alt="filter" width={18} className="me-2" />
                                    {getSelectedLanguageName()}
                                </div>
                                <FontAwesomeIcon icon={faChevronDown} />
                            </Dropdown.Toggle>

                            <Dropdown.Menu className="w-100 custom-dropdown-menu overflow-hidden" style={{ boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
                                <Dropdown.Item
                                    onClick={() => handleLanguageChange('')}
                                    active={selectedLanguage === ''}
                                    className="custom-dropdown-item"
                                >
                                    <input type="checkbox" checked={selectedLanguage === ''} readOnly className="me-2" />
                                    All Languages
                                </Dropdown.Item>
                                {language.map((lang) => (
                                    <Dropdown.Item
                                        key={lang.LanguageId}
                                        onClick={() => handleLanguageChange(lang.LanguageId.toString())}
                                        active={selectedLanguage === lang.LanguageId.toString()}
                                        className="custom-dropdown-item mt-1"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedLanguage === lang.LanguageId.toString()}
                                            readOnly
                                            className="me-2"
                                        />
                                        {lang.LanguageName}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>

                    {/* Category Filter */}
                    <div className="d-flex align-items-center gap-2 my-2">
                        <Dropdown>
                            <Dropdown.Toggle
                                variant="light"
                                id="category-dropdown"
                                className="bg-white border rounded-2 d-flex align-items-center justify-content-between"
                                style={{ minWidth: "320px" }}
                                bsPrefix="d-flex align-items-center justify-content-between"
                            >
                                <div className="d-flex align-items-center">
                                    <img src={filter} alt="filter" width={18} className="me-2" />
                                    {getSelectedCategoryName()}
                                </div>
                                <FontAwesomeIcon icon={faChevronDown} />
                            </Dropdown.Toggle>

                            <Dropdown.Menu className="w-100 custom-dropdown-menu overflow-hidden" style={{ boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
                                <Dropdown.Item
                                    onClick={() => handleCategoryChange('')}
                                    active={selectedCategory === ''}
                                    className="custom-dropdown-item"
                                >
                                    <input type="checkbox" checked={selectedCategory === ''} readOnly className="me-2" />
                                    All Categories
                                </Dropdown.Item>
                                {category.map((cat) => (
                                    <Dropdown.Item
                                        key={cat.CategoryId}
                                        onClick={() => handleCategoryChange(cat.CategoryId.toString())}
                                        active={selectedCategory === cat.CategoryId.toString()}
                                        className="custom-dropdown-item mt-1"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedCategory === cat.CategoryId.toString()}
                                            readOnly
                                            className="me-2"
                                        />
                                        {cat.CategoryName}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>

                    {/* Access Type Filter (replacing second language filter) */}
                    <div className="d-flex align-items-center gap-2 my-2">
                        <Dropdown>
                            <Dropdown.Toggle
                                variant="light"
                                id="access-dropdown"
                                className="bg-white border rounded-2 d-flex align-items-center justify-content-between"
                                style={{ minWidth: "320px" }}
                                bsPrefix="d-flex align-items-center justify-content-between"
                            >
                                <div className="d-flex align-items-center">
                                    <img src={filter} alt="filter" width={18} className="me-2" />
                                    {activeTab2 === '' ? 'All Access Types' : activeTab2}
                                </div>
                                <FontAwesomeIcon icon={faChevronDown} />
                            </Dropdown.Toggle>

                            <Dropdown.Menu className="w-100 custom-dropdown-menu overflow-hidden" style={{ boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
                                <Dropdown.Item
                                    onClick={() => setActiveTab2('')}
                                    active={activeTab2 === ''}
                                    className="custom-dropdown-item"
                                >
                                    <input type="checkbox" checked={activeTab2 === ''} readOnly className="me-2" />
                                    All Access Types
                                </Dropdown.Item>
                                {accessTypes.map((type) => (
                                    <Dropdown.Item
                                        key={type.id}
                                        onClick={() => setActiveTab2(type.id)}
                                        active={activeTab2 === type.id}
                                        className="custom-dropdown-item mt-1"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={activeTab2 === type.id}
                                            readOnly
                                            className="me-2"
                                        />
                                        {type.label}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>


                <div className='d-flex justify-content-between align-items-center px-4 py-3' style={{ borderBottom: "1px solid #E4E6E8", borderTop: "1px solid #E4E6E8" }}>
                    <div className='d-flex align-items-center gap-2'>
                        <span>Show</span>
                        <Dropdown>
                            <Dropdown.Toggle
                                variant="light"
                                id="access-dropdown"
                                className="bg-white border rounded-2 d-flex align-items-center justify-content-between"
                                style={{ minWidth: "120px" }}
                                bsPrefix="d-flex align-items-center justify-content-between"
                            >
                                {itemsPerPage || 'Select Items Per Page'}
                                <FontAwesomeIcon icon={faChevronDown} />
                            </Dropdown.Toggle>

                            <Dropdown.Menu className="w-100 custom-dropdown-menu overflow-hidden" style={{ boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
                                {itemsPerPageOptions.map((option) => (
                                    <Dropdown.Item
                                        key={option}
                                        onClick={() => handleItemsPerPageChange(option)}
                                        active={itemsPerPage === option}
                                        className="custom-dropdown-item mt-1"
                                    >
                                        {option}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>

                    </div>

                    <Button
                        onClick={() => toggleModal('add')}
                        className="rounded-3 border-0 py-2"
                        style={{ backgroundColor: "#F9E238", color: "black", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}
                    >
                        <FontAwesomeIcon icon={faPlus} className='pe-2' /> Add Audio Prank
                    </Button>
                </div>

                <div className="table-responsive px-4">
                    <Table className='text-center fs-6 w-100 bg-white'>
                        <thead>
                            <tr>
                                <td className='py-4' style={{ fontWeight: "600" }}>Id</td>
                                <td className='py-4' style={{ fontWeight: "600" }}>Audio Prank Name</td>
                                <td className='py-4' style={{ fontWeight: "600" }}>Artist Name</td>
                                <td className='py-4' style={{ fontWeight: "600" }}>Audio Prank Image</td>
                                <td className='py-4' style={{ fontWeight: "600" }}>Audio Prank File</td>
                                <td className='py-4' style={{ fontWeight: "600" }}>Prank Language</td>
                                <td className='py-4' style={{ fontWeight: "600" }}>Prank Category</td>
                                <td className='py-4' style={{ fontWeight: "600" }}>Premium</td>
                                <td className='py-4' style={{ fontWeight: "600" }}>Safe</td>
                                <td className='py-4' style={{ fontWeight: "600" }}>Trending</td>
                                <td className='py-4' style={{ fontWeight: "600" }}>Actions</td>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems && currentItems.length > 0 ? (
                                currentItems.map((audio, index) => (
                                    <tr key={audio._id} style={{ borderTop: "1px solid #E4E6E8" }}>
                                        <td>{indexOfFirstItem + index + 1}</td>
                                        <td>{audio.AudioName}</td>
                                        <td>{audio.ArtistName}</td>
                                        <td>
                                            <div className='d-flex2'>
                                                <button
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        padding: 0,
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={() => handleShowPreview(index)}
                                                >
                                                    <img
                                                        src={audio.AudioImage}
                                                        alt="Audio thumbnail"
                                                        style={{ width: '50px', height: '50px' }}
                                                    />
                                                </button>
                                                <Button
                                                    className="edit-dlt-btn text-black"
                                                    onClick={() => handleCopyToClipboard(audio.AudioImage)} // Use an arrow function to pass the parameter
                                                >
                                                    <FontAwesomeIcon icon={faCopy} />
                                                </Button>
                                            </div>
                                        </td>
                                        <td >
                                            <div className='d-flex2'>
                                                <audio controls>
                                                    <source src={audio.Audio} type="audio/mpeg" />
                                                    <track
                                                        kind="captions"
                                                        src={audio.AudioName}
                                                        srcLang="en"
                                                        label="English"
                                                        default
                                                    />
                                                    Your browser does not support the audio element.
                                                </audio>

                                                <Button
                                                    className="edit-dlt-btn text-black"
                                                    onClick={() => handleCopyToClipboard(audio.Audio)} // Use an arrow function to pass the parameter
                                                >
                                                    <FontAwesomeIcon icon={faCopy} />
                                                </Button>
                                            </div>
                                        </td>
                                        <td>{getLanguageName(audio.LanguageId)}</td>
                                        <td>{getCategoryName(audio.CategoryId)}</td>
                                        <td>
                                            <Button
                                                className='bg-transparent border-0 fs-4'
                                                style={{ color: audio.AudioPremium ? "#0385C3" : "#6c757d" }}
                                                onClick={() => handlePremiumToggle(audio._id, audio.AudioPremium)}
                                            >
                                                <FontAwesomeIcon
                                                    icon={audio.AudioPremium ? faToggleOn : faToggleOff}
                                                    title={audio.AudioPremium ? "Premium ON" : "Premium OFF"}
                                                />
                                            </Button>
                                        </td>
                                        <td>
                                            <Button className='bg-transparent border-0 fs-5' style={{ color: "#0385C3" }} onClick={() => handleSafeToggle(audio._id, audio.Safe)}>
                                                <FontAwesomeIcon icon={audio.Safe ? faEye : faEyeSlash} />
                                            </Button></td>
                                        <td>
                                            <FontAwesomeIcon
                                                icon={audio.trending ? faArrowTrendUp : faArrowTrendDown}
                                                title={audio.trending ? "up" : "down"}
                                                className='fs-5'
                                                style={{ color: audio.trending ? 'green' : 'red' }}
                                            />
                                        </td>
                                        <td>
                                            <Button className='edit-dlt-btn' style={{ color: "#0385C3" }} onClick={() => handleEdit(audio)}>
                                                <FontAwesomeIcon icon={faEdit} />
                                            </Button>
                                            <Button className='edit-dlt-btn text-danger' onClick={() => handleDelete(audio._id)}>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={11} className="text-center pb-4">No Data Found</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
                {totalPages > 1 && (
                    <div className='d-flex justify-content-between px-4 pt-1 align-items-center' style={{ borderTop: "1px solid #E4E6E8" }}>
                        <p className='m-0 fs-6' style={{ color: "#BFC3C7" }}>
                            Showing {startItem} to {endItem} of {totalItems} entries
                        </p>
                        <Pagination>
                            {renderPaginationItems()}
                        </Pagination>
                    </div>
                )}

            </div>

            <Modal
                show={visible}
                onHide={() => {
                    if (!isSubmitting) {
                        setImageUrlText(''); // Reset image URL text
                        setAudioUrlText(''); // Reset audio URL text
                        toggleModal('add');
                    }
                }}
                centered
                backdrop={isSubmitting ? 'static' : true}
                keyboard={!isSubmitting}
            >
                <Modal.Header >
                    <Modal.Title>{id ? "Edit Audio Prank" : "Add Audio Prank"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={formik.handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Prank Language<span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>* </span></Form.Label>
                            <Form.Control
                                as="select"
                                id="LanguageId"
                                name="LanguageId"
                                className='py-2'
                                value={formik.values.LanguageId}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                disabled={isSubmitting}
                                isInvalid={formik.touched.LanguageId && !!formik.errors.LanguageId}
                            >
                                <option value="">Select a Prank Language</option>
                                {language.map((language) => {
                                    return (
                                        <option key={language._id} value={language.LanguageId}>
                                            {language.LanguageName}
                                        </option>
                                    );
                                })}
                            </Form.Control>
                            {formik.errors.LanguageId && formik.touched.LanguageId && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.LanguageId}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Prank Category Name<span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>* </span></Form.Label>
                            <Form.Control
                                as="select"
                                id="CategoryId"
                                name="CategoryId"
                                className='py-2'
                                value={formik.values.CategoryId}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                disabled={isSubmitting}
                                isInvalid={formik.touched.CategoryId && !!formik.errors.CategoryId}
                            >
                                <option value="">Select a Prank Category</option>
                                {category.map((category) => {
                                    return (
                                        <option key={category._id} value={category.CategoryId}>
                                            {category.CategoryName}
                                        </option>
                                    );
                                })}
                            </Form.Control>
                            {formik.errors.CategoryId && formik.touched.CategoryId && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.CategoryId}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Audio Prank Name ( use searching )<span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>* </span></Form.Label>
                            <Form.Control
                                type="text"
                                id="AudioName"
                                name="AudioName"
                                className='py-2'
                                placeholder="Enter Audio Prank Name"
                                value={formik.values.AudioName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                disabled={isSubmitting}
                                isInvalid={formik.touched.AudioName && !!formik.errors.AudioName}
                            />
                            {formik.errors.AudioName && formik.touched.AudioName && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.AudioName}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Artist Name ( use searching )</Form.Label>
                            <Form.Control
                                type="text"
                                id="ArtistName"
                                name="ArtistName"
                                className='py-2'
                                placeholder="Enter ArtistName"
                                value={formik.values.ArtistName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                disabled={isSubmitting}
                                isInvalid={formik.touched.ArtistName && !!formik.errors.ArtistName}
                            />
                            {formik.errors.ArtistName && formik.touched.ArtistName && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.ArtistName}
                                </div>
                            )}
                        </Form.Group>


                        {renderFileInputSection('image', formik)}

                        {renderFileInputSection('audio', formik)}

                        <div className='d-flex flex-wrap gap-sm-4'>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="AudioPremium"
                                    name="AudioPremium"
                                    label="Premium Audio Prank"
                                    disabled={isSubmitting}
                                    checked={formik.values.AudioPremium}
                                    onChange={formik.handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="Safe"
                                    name="Safe"
                                    label="Safe Audio Prank"
                                    checked={formik.values.Safe}
                                    onChange={formik.handleChange}
                                    disabled={isSubmitting}
                                />
                            </Form.Group>
                        </div>

                        <Row className="mt-2">
                            <Col xs={6}>
                                <Button
                                    variant="secondary"
                                    onClick={() => toggleModal()}
                                    disabled={isSubmitting}
                                    className='w-100 rounded-3 text-black'
                                    style={{ background: "#F6F7FB" }}
                                >
                                    Cancel
                                </Button>
                            </Col>
                            <Col xs={6}>
                                <Button
                                    type="submit"
                                    className='submit border-0 rounded-3 w-100'
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Spinner size='sm' /> : 'Submit'}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
            </Modal >


            <ImagePreviewModal
                show={showPreview}
                onHide={() => setShowPreview(false)}
                images={filteredData.map(item => item.AudioImage)} // Changed from GalleryImage to AudioImage
                currentIndex={previewIndex}
                onNavigate={handlePreviewNavigation}
                totalImages={filteredData.length}
            />

            <ToastContainer />
        </div >
    );
};

export default Audio;
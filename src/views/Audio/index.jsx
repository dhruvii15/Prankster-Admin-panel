import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table, Pagination, Col, Row, Spinner, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faToggleOn, faToggleOff, faArrowUpFromBracket, faArrowTrendUp, faArrowTrendDown } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { faCopy, faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';

// img
import logo from "../../assets/images/logo.svg";

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
    const [safeFilter, setSafeFilter] = useState('');
    const [premiumFilter, setPremiumFilter] = useState('');

    // New state for category and additional filters
    const [activeTab, setActiveTab] = useState('all');
    const [selectedFilter, setSelectedFilter] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
    const [imageInputType, setImageInputType] = useState('file');
    const [audioInputType, setAudioInputType] = useState('file');
    const [imageUrlText, setImageUrlText] = useState('');
    const [audioUrlText, setAudioUrlText] = useState('');

    const inputTypes = [
        { id: 'file', label: 'File Upload' },
        { id: 'text', label: 'URL' }
    ];


    const getCategoryName = (categoryId) => {
        const cat = category.find(c => c.CategoryId === parseInt(categoryId));
        return cat ? cat.CategoryName : categoryId;
    };

    const getLanguageName = (languageId) => {
        const lang = language.find(l => l.LanguageId === parseInt(languageId));
        return lang ? lang.LanguageName : languageId;
    };

    const getAdminData = () => {
        axios.get('http://localhost:5001/api/admin/read')
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
                const response = await axios.post(`http://localhost:5001/api/${apiEndpoint}/${adminId}`, { type: "1" });

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

    const toggleModal = (mode) => {
        if (!visible) {
            if (mode === 'add') {
                setId(undefined);
                setSelectedImageFileName('');
                setSelectedAudioFileName('');
                formik.resetForm();
            }
        } else {
            formik.resetForm();
            setSelectedImageFileName('');
            setSelectedAudioFileName('');
        }
        setVisible(!visible);
    };

    const getData = () => {
        setLoading(true);
        axios.post('http://localhost:5001/api/audio/read')
            .then((res) => {
                const newData = res.data.data;
                setData(newData);
                filterAudioData(newData, activeTab, selectedFilter);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
                toast.error("Failed to fetch data.");
            });
    };


    useEffect(() => {
        getData();
        getAdminData();
    }, []);


    const getFilteredCount = (options = {}) => {
        const {
            categoryId = null,
            languageId = null,
            filterType = '',
            languageTab = 'all'
        } = options;

        // Start with base filtering by safe/unsafe
        let filtered = data.filter(item => item.Unsafe === !isOn);

        // Apply language filter
        if (languageTab !== 'all') {
            const selectedLanguage = language.find(cat => cat.LanguageName.toLowerCase() === languageTab);
            if (selectedLanguage) {
                filtered = filtered.filter(item => item.LanguageId === selectedLanguage.LanguageId);
            }
        }

        // Apply specific language filter if provided
        if (languageId) {
            filtered = filtered.filter(item => item.LanguageId === languageId);
        }

        // Apply language filter
        if (categoryId) {
            filtered = filtered.filter(item => item.CategoryId === parseInt(categoryId));
        }

        // Apply additional filters
        if (selectedCategoryFilter) {
            filtered = filtered.filter(item => item.CategoryId === parseInt(selectedCategoryFilter));
        }

        // Apply safe/unsafe filter
        if (safeFilter) {
            filtered = filtered.filter(item => {
                if (safeFilter === 'Safe') return !item.Hide;
                if (safeFilter === 'Unsafe') return item.Hide;
                return true;
            });
        }

        // Apply premium/free filter
        if (premiumFilter) {
            filtered = filtered.filter(item => {
                if (premiumFilter === 'Premium') return item.AudioPremium;
                if (premiumFilter === 'Free') return !item.AudioPremium;
                return true;
            });
        }

        return filtered.length;
    };

    const filterAudioData = () => {
        // Start with base filtering by safe/unsafe
        let filtered = data.filter(item => item.Unsafe === !isOn);

        // Apply language filter
        if (activeTab !== 'all') {
            const selectedLanguage = language.find(cat => cat.LanguageName.toLowerCase() === activeTab);
            if (selectedLanguage) {
                filtered = filtered.filter(item => item.LanguageId === selectedLanguage.LanguageId);
            }
        }

        // Apply category filter
        if (selectedCategoryFilter) {
            filtered = filtered.filter(item => item.CategoryId === parseInt(selectedCategoryFilter));
        }

        // Apply safe/unsafe filter
        if (safeFilter) {
            filtered = filtered.filter(item => {
                if (safeFilter === 'Safe') return !item.Hide;
                if (safeFilter === 'Unsafe') return item.Hide;
                return true;
            });
        }

        // Apply premium/free filter
        if (premiumFilter) {
            filtered = filtered.filter(item => {
                if (premiumFilter === 'Premium') return item.AudioPremium;
                if (premiumFilter === 'Free') return !item.AudioPremium;
                return true;
            });
        }

        setFilteredData(filtered);
    };

    useEffect(() => {
        filterAudioData();
    }, [activeTab, safeFilter, premiumFilter, selectedCategoryFilter, data, isOn]);


    const audioSchema = Yup.object().shape({
        AudioName: Yup.string().required('Audio Prank Name is required'),
        Audio: Yup.mixed()
            .test('fileOrText', 'Either file upload or URL is required', function (value) {
                if (formik.values.isEditing && !value) return true;
                if (audioInputType === 'text') return !!audioUrlText;
                return value instanceof File;
            })
            .test(
                'fileType',
                'Only audio files are allowed (mp3, wav)',
                function (value) {
                    if (audioInputType === 'text') return true;
                    if (value instanceof File) {
                        const allowedExtensions = ['audio/mpeg', 'audio/wav'];
                        return allowedExtensions.includes(value.type);
                    }
                    return true;
                }
            ),
        AudioImage: Yup.mixed()
            .test('fileOrText', 'Either file upload or URL is required', function (value) {
                if (formik.values.isEditing && !value) return true;
                if (imageInputType === 'text') return !!imageUrlText;
                if (!value) return true; // Optional field
                return value instanceof File;
            })
            .test(
                'fileType',
                'Only image files are allowed (jpg, png)',
                function (value) {
                    if (imageInputType === 'text') return true;
                    if (value instanceof File) {
                        const allowedExtensions = ['image/jpeg', 'image/png', 'image/jpg'];
                        return allowedExtensions.includes(value.type);
                    }
                    return true;
                }
            ),
        AudioPremium: Yup.boolean(),
        CategoryId: Yup.string().required('Prank Category Name is required'),
        LanguageId: Yup.string().required('Prank Language is required'),
        Hide: Yup.boolean(),
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
            Unsafe: false
        },
        validationSchema: audioSchema,
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
                formData.append('Hide', values.Hide);
                formData.append('Unsafe', "false");
                formData.append('imageInputType', imageInputType);
                formData.append('audioInputType', audioInputType);

                const request = id !== undefined
                    ? axios.patch(`http://localhost:5001/api/audio/update/${id}`, formData)
                    : axios.post('http://localhost:5001/api/audio/create', formData);

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
            Hide: audio.Hide,
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
        axios.patch(`http://localhost:5001/api/audio/update/${audioId}`, { AudioPremium: !currentPremiumStatus })
            .then((res) => {
                getData();
                toast.success(res.data.message);
            })
            .catch((err) => {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            });
    };

    const handleHideToggle = (audioId, currentHideStatus) => {
        axios.patch(`http://localhost:5001/api/audio/update/${audioId}`, { Hide: !currentHideStatus })
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
            axios.delete(`http://localhost:5001/api/audio/delete/${audioId}`)
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
    const itemsPerPage = 15;
    const [currentPage, setCurrentPage] = useState(1);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
        if (audio?.Audio) {
            navigator.clipboard.writeText(audio.Audio)
                .then(() => {
                    toast.success("audio URL copied to clipboard!");
                })
                .catch((error) => {
                    console.error("Failed to copy: ", error);
                });
        } else {
            alert("No URL to copy!");
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
                            style={{
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                border: `1px solid ${inputType === type.id ? '' : '#dee2e6'}`
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
                            onChange={(e) => setUrlText(e.target.value)}
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
            <img src={logo} alt='loading....' style={{
                animation: "1.2s ease-out infinite zoom-in-zoom-out2", width: "200px"
            }} />
        </div>
    );

    return (
        <div>
            <div className='d-sm-flex justify-content-between align-items-center'>
                <div>
                    <h4>Audio Prank</h4>
                </div>
                <Form className='d-flex align-items-center gap-3'>
                    <span>Safe : </span>
                    <Form.Check
                        type="switch"
                        id="custom-switch"
                        checked={isOn}
                        onChange={handleToggle}
                        className="custom-switch-lg"
                        style={{ transform: 'scale(1.3)' }}
                        disabled={isSubmitting2}
                    />
                </Form>
            </div>
            <div className='d-flex flex-wrap gap-3 justify-content-between align-items-center mt-4'>
                <Button
                    onClick={() => toggleModal('add')}
                    className='rounded-3 border-0'
                    style={{ backgroundColor: "#F9E238", color: "black" }}
                >
                    Add Audio Prank
                </Button>
                <div className='d-flex gap-3 align-items-center'>
                    <div className='d-flex gap-2 align-items-center'>
                        <span className='mb-0 fw-bold fs-6'>Safety :</span>
                        <Form.Select
                            value={safeFilter}
                            onChange={(e) => setSafeFilter(e.target.value)}
                            style={{ width: 'auto' }}
                            className='bg-white fs-6'
                        >
                            <option value="">All</option>
                            <option value="Safe">Safe</option>
                            <option value="Unsafe">Unsafe</option>
                        </Form.Select>
                    </div>
                    
                    <div className='d-flex gap-2 align-items-center'>
                        <span className='mb-0 fw-bold fs-6'>Access :</span>
                        <Form.Select
                            value={premiumFilter}
                            onChange={(e) => setPremiumFilter(e.target.value)}
                            style={{ width: 'auto' }}
                            className='bg-white fs-6'
                        >
                            <option value="">All</option>
                            <option value="Premium">Premium</option>
                            <option value="Free">Free</option>
                        </Form.Select>
                    </div>
                </div>
            </div>


            <div className='d-flex gap-4 flex-wrap align-items-end mb-3 justify-content-between'>
                <div className='d-inline-block '>
                    <Nav variant="tabs" className='pt-5 mt-3'>
                        <Nav.Item>
                            <Nav.Link
                                active={activeTab === 'all'}
                                className={activeTab === 'all' ? 'active-tab' : ''}
                                onClick={() => setActiveTab('all')}
                            >
                                All ({getFilteredCount({
                                    filterType: selectedFilter,
                                    categoryId: selectedCategoryFilter
                                })})
                            </Nav.Link>
                        </Nav.Item>
                        {language.map((cat) => (
                            <Nav.Item key={cat.LanguageId}>
                                <Nav.Link
                                    active={activeTab === cat.LanguageName.toLowerCase()}
                                    className={activeTab === cat.LanguageName.toLowerCase() ? 'active-tab' : ''}
                                    onClick={() => setActiveTab(cat.LanguageName.toLowerCase())}
                                >
                                    <span className="pe-2">{cat.LanguageName}</span>
                                    ({getFilteredCount({
                                        languageId: cat.LanguageId,
                                        filterType: selectedFilter,
                                        categoryId: selectedCategoryFilter,
                                        languageTab: cat.LanguageName.toLowerCase()
                                    })})
                                </Nav.Link>
                            </Nav.Item>
                        ))}
                    </Nav>
                </div>
                <div className='d-flex gap-2 align-items-center'>
                    <span className='mb-0 fw-bold fs-6'>Category :</span>
                    <Form.Select
                        value={selectedCategoryFilter}
                        onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                        style={{ width: 'auto' }}
                        className='bg-white fs-6'
                    >
                        <option value="">All Categories</option>
                        {category.map((lang) => (
                            <option key={lang.CategoryId} value={lang.CategoryId}>
                                {lang.CategoryName}
                            </option>
                        ))}
                    </Form.Select>
                </div>
            </div>

            <Modal
                show={visible}
                onHide={() => !isSubmitting && toggleModal('add')}
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
                                    id="Hide"
                                    name="Hide"
                                    label="Safe Audio Prank"
                                    checked={formik.values.Hide}
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

            <Table striped bordered hover responsive className='text-center fs-6'>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Audio Prank Name</th>
                        <th>Artist Name</th>
                        <th>Audio Prank Image</th>
                        <th>Audio Prank File</th>
                        <th>Prank Language</th>
                        <th>Prank Category</th>
                        <th>Premium</th>
                        <th>Safe</th>
                        <th>Trending</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems && currentItems.length > 0 ? (
                        currentItems.map((audio, index) => (
                            <tr key={audio._id} className={index % 2 === 1 ? 'bg-light2' : ''}>
                                <td style={{
                                    backgroundColor: audio.Hide ? '#ffcccc' : ''
                                }}>{indexOfFirstItem + index + 1}</td>
                                <td>{audio.AudioName}</td>
                                <td>{audio.ArtistName}</td>
                                <td>
                                    <img src={audio.AudioImage} alt="Audio thumbnail" style={{ width: '50px', height: '50px' }} />
                                </td>
                                <td>
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
                                    <Button className='bg-transparent border-0 fs-5' style={{ color: "#0385C3" }} onClick={() => handleHideToggle(audio._id, audio.Hide)}>
                                        <FontAwesomeIcon icon={audio.Hide ? faEyeSlash : faEye} />
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
                                    <Button
                                        className="edit-dlt-btn text-black"
                                        onClick={() => handleCopyToClipboard(audio)} // Use an arrow function to pass the parameter
                                    >
                                        <FontAwesomeIcon icon={faCopy} />
                                    </Button>
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
                            <td colSpan={11} className="text-center">No Data Found</td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {
                totalPages > 1 && (
                    <div className='d-flex justify-content-center'>
                        <Pagination>
                            {renderPaginationItems()}
                        </Pagination>
                    </div>
                )
            }

            <ToastContainer />
        </div >
    );
};

export default Audio;
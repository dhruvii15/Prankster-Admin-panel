import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table, Pagination, Row, Col, Spinner, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faToggleOn, faToggleOff, faArrowUpFromBracket, faArrowTrendUp, faArrowTrendDown } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import { faCopy, faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import 'react-toastify/dist/ReactToastify.css';

// img
import logo from "../../assets/images/logo.svg";
import ImagePreviewModal from 'components/ImagePreviewModal';

const Gallery = () => {

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
    const [imageFileLabel, setImageFileLabel] = useState('Image Prank Image Upload');
    const [filteredData, setFilteredData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(0);
    const [isOn, setIsOn] = useState(false);
    const [isSubmitting2, setIsSubmitting2] = useState(false);
    const [adminId, setAdminId] = useState(null);

    // New state for language and additional filters
    const [activeTab, setActiveTab] = useState('all');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
    const [inputType, setInputType] = useState('file');
    const [imageUrlText, setImageUrlText] = useState('');
    // const [safeFilter, setSafeFilter] = useState('');
    const [premiumFilter, setPremiumFilter] = useState('');

    const inputTypes = [
        { id: 'file', label: 'File Upload' },
        { id: 'text', label: 'URL' }
    ];

    const isValidImageUrl = (url) => {
        // Basic URL validation
        const urlPattern = /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
        return urlPattern.test(url);
    };


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
                setIsOn(res.data.data[0].ImageSafe);
                setAdminId(res.data.data[0]._id);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to fetch admin data.");
            });
    };

    const toggleModal = (mode) => {
        if (!visible) {
            if (mode === 'add') {
                setId(undefined);
                setImageFileLabel('Image Prank Image Upload');
                setSelectedFileName('');
                setImageUrlText(''); // Reset image URL text
                formik.resetForm();
            }
        } else {
            formik.resetForm();
            setSelectedFileName('');
            setImageUrlText(''); // Reset image URL text
            setImageFileLabel('Image Prank Image Upload');
            setInputType('file'); // Reset input type to file
        }
        setVisible(!visible);
    };

    const getData = () => {
        setLoading(true);
        axios.post('https://pslink.world/api/gallery/read')
            .then((res) => {
                const newData = res.data.data
                setData(newData);
                filterGalleryData(newData, activeTab);
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

    const getFilteredCount = (options = {}) => {
        const {
            categoryId = null,
            languageId = null,
            languageTab = 'all'
        } = options;

        // Start with base filtering by safe/unsafe
        let filtered = data.filter(item => item.Safe === isOn);

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

        if (selectedCategoryFilter) {
            filtered = filtered.filter(item => item.CategoryId === parseInt(selectedCategoryFilter));
        }

        // Apply additional filters
        // if (safeFilter) {
        //     filtered = filtered.filter(item => {
        //         if (safeFilter === 'Safe') return !item.Hide;
        //         if (safeFilter === 'Unsafe') return item.Hide;
        //         return true;
        //     });
        // }

        // Apply premium/free filter
        if (premiumFilter) {
            filtered = filtered.filter(item => {
                if (premiumFilter === 'Premium') return item.GalleryPremium;
                if (premiumFilter === 'Free') return !item.GalleryPremium;
                return true;
            });
        }

        return filtered.length;
    };

    const filterGalleryData = () => {
        // Start with base filtering by safe/unsafe
        let filtered = data.filter(item => item.Safe === isOn);

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
        // if (safeFilter) {
        //     filtered = filtered.filter(item => {
        //         if (safeFilter === 'Safe') return !item.Hide;
        //         if (safeFilter === 'Unsafe') return item.Hide;
        //         return true;
        //     });
        // }

        // Apply premium/free filter
        if (premiumFilter) {
            filtered = filtered.filter(item => {
                if (premiumFilter === 'Premium') return item.GalleryPremium;
                if (premiumFilter === 'Free') return !item.GalleryPremium;
                return true;
            });
        }

        setFilteredData(filtered);
    };

    useEffect(() => {
        filterGalleryData();
    }, [activeTab, premiumFilter, selectedCategoryFilter, data, isOn]); //safeFilter

    const handleToggle = async () => {
        if (!isSubmitting2) {
            const newState = !isOn;
            try {
                setIsSubmitting2(true);
                setIsOn(newState);

                // Call the appropriate API based on the state
                const apiEndpoint = newState ? 'safe' : 'unsafe';
                const response = await axios.post(`https://pslink.world/api/${apiEndpoint}/${adminId}`, { type: "3" });

                // Reset to first page when toggling safe mode
                setCurrentPage(1);
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

    // Update useEffect to handle filtering
    useEffect(() => {
        filterGalleryData(data, activeTab);
    }, [activeTab, data]);

    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            if (file.type === 'image/gif') {
                resolve(file); // Return GIF as-is
                return;
            }

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

    // Updated handleFileChange method
    const handleFileChange = async (event) => {
        const file = event.currentTarget.files[0];
        if (file) {
            try {
                // Check if file is a GIF
                const isGif = file.type === 'image/gif';

                let processedFile;
                if (isGif) {
                    // For GIFs, check size directly without compression
                    if (file.size > 5 * 1024 * 1024) {
                        toast.error('GIF file size must be under 5MB');
                        return;
                    }
                    processedFile = file;
                } else {
                    // For other image types, compress them
                    processedFile = await compressImage(file);
                    if (processedFile.size > 5 * 1024 * 1024) {
                        toast.error('Compressed file still exceeds 5MB limit');
                        return;
                    }
                }

                // Update Formik field and file state
                formik.setFieldValue("GalleryImage", processedFile);
                setSelectedFileName(processedFile.name);
                setImageFileLabel('Image Prank Image uploaded');
            } catch (error) {
                toast.error('Error processing image');
                console.error(error);
            }
        }
    };

    const gallerySchema = Yup.object().shape({
        GalleryName: Yup.string().required('Image Prank Name is required'),
        GalleryImage: Yup.mixed()
            .test('fileOrText', 'Either file upload or URL is required', function (value) {
                if (this.parent.isEditing && !value && this.parent.originalValues?.GalleryImage) return true;
                if (inputType === 'text') return !!imageUrlText;
                return value instanceof File;
            })
            .test('validImageUrl', 'Invalid image URL format.', function () {
                if (inputType === 'text' && imageUrlText) {
                    return isValidImageUrl(imageUrlText);
                }
                return true;
            })
            .test(
                'fileType',
                'Only image files are allowed (jpg, png, gif, webp)',
                function (value) {
                    if (inputType === 'text') return true;
                    if (value instanceof File) {
                        const allowedExtensions = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
                        return allowedExtensions.includes(value.type);
                    }
                    return true;
                }
            )
            .test(
                'fileSize',
                'File size must be less than 5MB',
                function (value) {
                    if (inputType === 'text') return true;
                    if (value instanceof File) {
                        return value.size <= 5 * 1024 * 1024;
                    }
                    return true;
                }
            ),
        GalleryPremium: Yup.boolean(),
        CategoryId: Yup.string().required('Prank Category Name is required'),
        LanguageId: Yup.string().required('Language is required'),
        Hide: Yup.boolean(),
        Safe: Yup.boolean(),
        isEditing: Yup.boolean()
    });

    const formik = useFormik({
        initialValues: {
            GalleryName: '',
            GalleryImage: '',
            GalleryPremium: false,
            CategoryId: '',
            LanguageId: '',
            Hide: false,
            isEditing: false,
            Safe: false,
            originalValues: null // To track original values
        },
        validationSchema: gallerySchema,
        validateOnMount: false, // Disable validation on mount
        validateOnBlur: true,  // Disable validation on blur
        validateOnChange: true,

        validate: () => {
            const errors = {};

            if (inputType === 'text' && imageUrlText && !isValidImageUrl(imageUrlText)) {
                errors.GalleryImage = 'Invalid image URL format . (ending with .jpg, .jpeg, or .png)';
            }

            return errors;
        },
        onChange: () => {
            // Clear errors when fields are changed
            formik.setErrors({});
        },

        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                setIsSubmitting(true);
                const formData = new FormData();

                // Check if any field was modified during editing
                const isFieldModified = () => {
                    if (!values.originalValues) return true; // For new entries

                    // Compare current values with original values
                    return (
                        values.GalleryName !== values.originalValues.GalleryName ||
                        values.GalleryPremium !== values.originalValues.GalleryPremium ||
                        values.CategoryId !== values.originalValues.CategoryId ||
                        values.LanguageId !== values.originalValues.LanguageId ||
                        values.Safe !== values.originalValues.Safe ||
                        (inputType === 'file' && values.GalleryImage instanceof File) ||
                        (inputType === 'text' && imageUrlText !== values.originalValues.GalleryImage)
                    );
                };

                // Only include Hide field if editing and fields were modified
                if (values.isEditing) {
                    if (isFieldModified()) {
                        formData.append('Hide', !values.Safe);
                    }
                } else {
                    if (isOn) {
                        formData.append('Hide', !values.Safe);
                    } else {
                        formData.append('Hide', false);
                    }
                }

                // Append other form fields
                if (inputType === 'file' && values.GalleryImage instanceof File) {
                    formData.append('GalleryImage', values.GalleryImage);
                } else if (inputType === 'text') {
                    formData.append('GalleryImage', imageUrlText);
                }

                formData.append('GalleryName', values.GalleryName);
                formData.append('GalleryPremium', values.GalleryPremium);
                formData.append('CategoryId', values.CategoryId);
                formData.append('LanguageId', values.LanguageId);
                formData.append('Safe', values.Safe);
                formData.append('inputType', inputType);

                const request = id !== undefined
                    ? axios.patch(`https://pslink.world/api/gallery/update/${id}`, formData)
                    : axios.post('https://pslink.world/api/gallery/create', formData);

                const res = await request;
                setSubmitting(false);
                resetForm();
                setId(undefined);
                setImageFileLabel('Image Prank Image Upload');
                setImageUrlText('');
                setSelectedFileName('');
                getData();
                toast.success(res.data.message);
                toggleModal('add');
            } catch (err) {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            } finally {
                setIsSubmitting(false);
                setSubmitting(false);
            }
        },
    });

    const handleEdit = (gallery) => {
        const fileName = gallery.GalleryImage.split('/').pop();
        setSelectedFileName(fileName);
        setImageUrlText(gallery.GalleryImage);
        setInputType(gallery.GalleryImage.startsWith('http') ? 'text' : 'file');

        formik.setValues({
            GalleryName: gallery.GalleryName,
            GalleryImage: '',
            GalleryPremium: gallery.GalleryPremium,
            CategoryId: gallery.CategoryId,
            LanguageId: gallery.LanguageId,
            Hide: gallery.Safe,
            Safe: gallery.Safe,
            isEditing: true,
            originalValues: { ...gallery } // Store original values
        });
        setId(gallery._id);
        setImageFileLabel('Image Prank Image Upload');
        toggleModal('edit');
    };

    const handleSafeToggle = (galleryId, currentSafeStatus) => {
        axios.patch(`https://pslink.world/api/gallery/update/${galleryId}`, { Safe: !currentSafeStatus, Hide: currentSafeStatus })
            .then((res) => {
                getData();
                toast.success(res.data.message);
            })
            .catch((err) => {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            });
    };

    const handlePremiumToggle = (galleryId, currentPremiumStatus) => {
        axios.patch(`https://pslink.world/api/gallery/update/${galleryId}`, { GalleryPremium: !currentPremiumStatus })
            .then((res) => {
                getData();
                toast.success(res.data.message);
            })
            .catch((err) => {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            });
    };

    const handleDelete = (galleryId) => {
        if (window.confirm("Are you sure you want to delete this Image Prank Image?")) {
            axios.delete(`https://pslink.world/api/gallery/delete/${galleryId}`)
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

    const handleShowPreview = (currentPageIndex) => {
        // Calculate the actual index in the full filtered dataset
        const actualIndex = (currentPage - 1) * itemsPerPage + currentPageIndex;
        setPreviewIndex(actualIndex);
        setShowPreview(true);
    };

    // Navigation in preview should work across all pages
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

    console.log(filteredData);
    
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

    const handleCopyToClipboard = (gallery) => {
        if (gallery?.GalleryImage) {
            navigator.clipboard.writeText(gallery.GalleryImage)
                .then(() => {
                    toast.success("Image URL copied to clipboard!");
                })
                .catch((error) => {
                    console.error("Failed to copy: ", error);
                });
        } else {
            alert("No URL to copy!");
        }
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
                    <h4>Image Prank</h4>
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
                    Add Image Prank
                </Button>

                <div className='d-flex gap-3 align-items-center'>
                    {/* <div className='d-flex gap-2 align-items-center'>
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
                    </div> */}

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
                    <Modal.Title>{id ? "Edit Image Prank" : "Add Image Prank"}</Modal.Title>
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
                                disabled={isSubmitting}
                                value={formik.values.CategoryId}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
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
                            <Form.Label className='fw-bold'>Image Prank Name ( use searching ) <span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>* </span></Form.Label>
                            <Form.Control
                                type="text"
                                id="GalleryName"
                                name="GalleryName"
                                className='py-2'
                                placeholder="Enter Image Prank Name"
                                disabled={isSubmitting}
                                value={formik.values.GalleryName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={formik.touched.GalleryName && !!formik.errors.GalleryName}
                            />
                            {formik.errors.GalleryName && formik.touched.GalleryName && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.GalleryName}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>
                                Image Input Type
                                <span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>*</span>
                            </Form.Label>
                            <div className="d-flex gap-3 mb-3">
                                {inputTypes.map((type) => (
                                    <div
                                        key={type.id}
                                        onClick={() => !isSubmitting && setInputType(type.id)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                !isSubmitting && setInputType(type.id);
                                            }
                                        }}
                                        role="button"
                                        tabIndex={0}
                                        className={`cursor-pointer px-3 py-1 rounded-3 ${inputType === type.id ? 'bg-primary' : 'bg-light'}`}
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
                                        {imageFileLabel}
                                        <span className='ps-2' style={{ fontSize: "12px" }}>(5 MB)</span>
                                        <span className='text-danger fw-normal' style={{ fontSize: "17px" }}>*</span>
                                    </Form.Label>
                                    <div className="d-flex align-items-center">
                                        <Form.Control
                                            type="file"
                                            id="GalleryImage"
                                            name="GalleryImage"
                                            accept="image/*,.png,.jpg,.jpeg,.gif,.webp"
                                            disabled={isSubmitting}
                                            onChange={handleFileChange}
                                            onBlur={formik.handleBlur}
                                            className="d-none"
                                        />
                                        <label htmlFor="GalleryImage" className="btn mb-0 p-4 bg-white w-100 rounded-2" style={{ border: "1px dotted #c1c1c1" }}>
                                            <FontAwesomeIcon icon={faArrowUpFromBracket} style={{ fontSize: "15px" }} />
                                            <div style={{ color: "#c1c1c1" }} className='pt-1'>Select Image Prank Image</div>
                                            {selectedFileName && (
                                                <span style={{ fontSize: "0.8rem", color: "#5E95FE" }}>
                                                    {selectedFileName}
                                                </span>
                                            )}
                                        </label>
                                    </div>
                                </>
                            ) : (
                                <Form.Group>
                                    <Form.Label className='fw-bold'>
                                        Image URL
                                        <span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter image URL"
                                        value={imageUrlText}
                                        onChange={(e) => {
                                            const newValue = e.target.value;
                                            setImageUrlText(newValue);
                                            formik.setFieldValue('GalleryImage', newValue);
                                            // Clear error when user starts typing
                                            if (formik.errors.GalleryImage) {
                                                formik.setFieldError('GalleryImage', '');
                                            }
                                        }}
                                        onBlur={() => {
                                            if (imageUrlText && !isValidImageUrl(imageUrlText)) {
                                                formik.setFieldError('GalleryImage', 'Invalid image URL format.');
                                            }
                                        }}
                                        isInvalid={!!formik.errors.GalleryImage}
                                        disabled={isSubmitting}
                                    />
                                </Form.Group>
                            )}

                            {formik.touched.GalleryImage && formik.errors.GalleryImage && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.GalleryImage}
                                </div>
                            )}
                        </Form.Group>

                        <div className='d-flex flex-wrap gap-sm-4'>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="GalleryPremium"
                                    name="GalleryPremium"
                                    label="Premium Image Prank"
                                    disabled={isSubmitting}
                                    checked={formik.values.GalleryPremium}
                                    onChange={formik.handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="Safe"
                                    name="Safe"
                                    label="Safe Image Prank"
                                    disabled={isSubmitting}
                                    checked={formik.values.Safe}
                                    onChange={formik.handleChange}
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
            </Modal>

            <Table striped bordered hover responsive className='text-center fs-6'>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Image Prank Name</th>
                        <th>Image Prank Image</th>
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
                        currentItems.map((gallery, index) => (
                            <tr key={gallery._id} className={index % 2 === 1 ? 'bg-light2' : ''}>
                                <td>{indexOfFirstItem + index + 1}</td>
                                <td>{gallery.GalleryName}</td>
                                <td>
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
                                            src={gallery.GalleryImage}
                                            alt="Gallery thumbnail"
                                            style={{ width: '100px', height: '100px' }}
                                        />
                                    </button>
                                </td>

                                <td>{getLanguageName(gallery.LanguageId)}</td>
                                <td>{getCategoryName(gallery.CategoryId)}</td>
                                <td>
                                    <Button
                                        className='bg-transparent border-0 fs-4'
                                        style={{ color: gallery.GalleryPremium ? "#0385C3" : "#6c757d" }}
                                        onClick={() => handlePremiumToggle(gallery._id, gallery.GalleryPremium)}
                                    >
                                        <FontAwesomeIcon
                                            icon={gallery.GalleryPremium ? faToggleOn : faToggleOff}
                                            title={gallery.GalleryPremium ? "Premium ON" : "Premium OFF"}
                                        />
                                    </Button>
                                </td>
                                <td>
                                    <Button className='bg-transparent border-0 fs-5' style={{ color: "#0385C3" }} onClick={() => handleSafeToggle(gallery._id, gallery.Safe)}>
                                        <FontAwesomeIcon icon={gallery.Safe ? faEye : faEyeSlash} />
                                    </Button>
                                </td>
                                <td>
                                    <FontAwesomeIcon
                                        icon={gallery.trending ? faArrowTrendUp : faArrowTrendDown}
                                        title={gallery.trending ? "up" : "down"}
                                        className='fs-5'
                                        style={{ color: gallery.trending ? 'green' : 'red' }}
                                    />
                                </td>
                                <td>
                                    <Button
                                        className="edit-dlt-btn text-black"
                                        onClick={() => handleCopyToClipboard(gallery)} // Use an arrow function to pass the parameter
                                    >
                                        <FontAwesomeIcon icon={faCopy} />
                                    </Button>
                                    <Button className='edit-dlt-btn' style={{ color: "#0385C3" }} onClick={() => handleEdit(gallery)}>
                                        <FontAwesomeIcon icon={faEdit} />
                                    </Button>
                                    <Button className='edit-dlt-btn text-danger' onClick={() => handleDelete(gallery._id)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={9} className="text-center">No Data Found</td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {totalPages > 1 && (
                <div className='d-flex justify-content-center'>
                    <Pagination>
                        {renderPaginationItems()}
                    </Pagination>
                </div>
            )}

            <ToastContainer />

            <ImagePreviewModal
                show={showPreview}
                onHide={() => setShowPreview(false)}
                images={filteredData.map(item => item.GalleryImage)}
                currentIndex={previewIndex}
                onNavigate={handlePreviewNavigation}
                totalImages={filteredData.length}
            />
        </div>
    );
};

export default Gallery;
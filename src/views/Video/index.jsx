import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table, Pagination, Row, Col, Spinner, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faToggleOn, faToggleOff, faArrowUpFromBracket, faArrowTrendUp, faArrowTrendDown, faChevronDown, faPlus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { faCopy, faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';

// img
import filter from "../../assets/images/filter.png"


const Video = () => {

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
    const [videoFileLabel, setVideoFileLabel] = useState('Video Prank File Upload');
    const [filteredData, setFilteredData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedVideoFileName, setSelectedVideoFileName] = useState("");
    const [currentVideoFileName, setCurrentVideoFileName] = useState('');

    // New state variables for safe/unsafe functionality
    const [isOn, setIsOn] = useState(false);
    const [isSubmitting2, setIsSubmitting2] = useState(false);
    const [adminId, setAdminId] = useState(null);
    const [inputType, setInputType] = useState('file');
    const [videoUrlText, setVideoUrlText] = useState('');
    // const [safetyFilter, setSafetyFilter] = useState('');
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

    const isValidVideoUrl = (url) => {
        if (!url) return false;
        // Basic URL validation for video files
        const videoRegex = /^https?:\/\/.*\.(mp4|mkv|avi|mov|wmv)$/i;
        return videoRegex.test(url);
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
                setIsOn(res.data.data[0].VideoSafe);
                setAdminId(res.data.data[0]._id);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to fetch admin data.");
            });
    };

    // Modified handleToggle function for safe/unsafe
    const handleToggle = async () => {
        if (!isSubmitting2) {
            const newState = !isOn;
            try {
                setIsSubmitting2(true);
                setIsOn(newState);

                // Call the appropriate API based on the state
                const apiEndpoint = newState ? 'safe' : 'unsafe';
                const response = await axios.post(`https://pslink.world/api/${apiEndpoint}/${adminId}`, { type: "2" });

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
                setVideoFileLabel('Video Prank File Upload');
                setSelectedVideoFileName('');
                setCurrentVideoFileName('');
                setVideoUrlText(''); // Reset Video URL text
                setInputType('file'); // Reset input type to file
                const fileInput = document.getElementById('Video');
                if (fileInput) {
                    fileInput.value = '';
                }
                formik.resetForm();
            }
        } else {
            formik.resetForm();
            setVideoFileLabel('Video Prank File Upload');
            setSelectedVideoFileName('');
            setCurrentVideoFileName('');
            setVideoUrlText(''); // Reset Video URL text
            setInputType('file'); // Reset input type to file
            const fileInput = document.getElementById('Video');
            if (fileInput) {
                fileInput.value = '';
            }
        }
        setVisible(!visible);
    };

    const getData = () => {
        setLoading(true);
        axios.post('https://pslink.world/api/video/read')
            .then((res) => {
                const newData = res.data.data
                setData(newData);
                // Remove the filterVideoData call here
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
    //     // if (safetyFilter === 'safe') {
    //     //     filtered = filtered.filter(item => !item.Hide);
    //     // } else if (safetyFilter === 'unsafe') {
    //     //     filtered = filtered.filter(item => item.Hide);
    //     // }

    //     // Apply premium filter
    //     if (activeTab2 === "Premium") {
    //         filtered = filtered.filter(item => item.VideoPremium); // Only show premium items
    //     } else if (activeTab2 === "Free") {
    //         filtered = filtered.filter(item => !item.VideoPremium); // Only show free items
    //     }

    //     return filtered.length;
    // };

    const filterVideoData = () => {
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
            filtered = filtered.filter(item => item.VideoPremium);
        } else if (activeTab2 === "Free") {
            filtered = filtered.filter(item => !item.VideoPremium);
        }

        setFilteredData(filtered);
    };

    // Handle language selection
    const handleLanguageChange = (value) => {
        setSelectedLanguage(value);
        setSelectedCategory('');
        setCurrentPage(1);
    };

    // Handle category selection
    const handleCategoryChange = (value) => {
        setSelectedCategory(value);
        setCurrentPage(1);
    };

    // Get selected names for display
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

    useEffect(() => {
        filterVideoData();
    }, [selectedLanguage, selectedCategory, data, isOn, activeTab2]);


    const videoSchema = Yup.object().shape({
        VideoName: Yup.string().required('Video Prank Name is required'),
        Video: Yup.mixed()
            .test('fileOrText', 'Either file upload or URL is required', function (value) {
                if (formik.values.isEditing && !value && currentVideoFileName) return true;
                if (inputType === 'text') {
                    // Only validate if URL is provided
                    if (!videoUrlText) return true;
                    return isValidVideoUrl(videoUrlText);
                }
                return value instanceof File;
            })
            .test(
                'validateInput',
                'Please provide a valid video file or URL',
                function (value) {
                    if (inputType === 'text') {
                        // Only validate if URL is provided
                        if (!videoUrlText) return true;
                        return isValidVideoUrl(videoUrlText);
                    }
                    if (value instanceof File) {
                        const allowedExtensions = [
                            'video/mp4',
                            'video/x-matroska',
                            'video/x-msvideo',
                        ];
                        return allowedExtensions.includes(value.type);
                    }
                    return true;
                }
            ),
        VideoPremium: Yup.boolean(),
        CategoryId: Yup.string().required('Prank Category Name is required'),
        LanguageId: Yup.string().required('Prank Language is required'),
        Hide: Yup.boolean(),
        Safe: Yup.boolean(),
        isEditing: Yup.boolean()
    });

    const formik = useFormik({
        initialValues: {
            VideoName: '',
            ArtistName: '',
            Video: '',
            VideoPremium: false,
            CategoryId: '',
            LanguageId: '',
            Hide: false,
            isEditing: false,
            Safe: false
        },
        validationSchema: videoSchema,
        validateOnMount: false, // Disable validation on mount
        validateOnBlur: true,  // Disable validation on blur
        validateOnChange: true,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                setIsSubmitting(true);
                const formData = new FormData();

                // Handle video input based on input type
                if (inputType === 'file' && values.Video instanceof File) {
                    formData.append('Video', values.Video);
                } else if (inputType === 'text') {
                    formData.append('Video', videoUrlText);
                }

                formData.append('VideoName', values.VideoName);
                formData.append('ArtistName', values.ArtistName);
                formData.append('VideoPremium', values.VideoPremium);
                formData.append('CategoryId', values.CategoryId);
                formData.append('LanguageId', values.LanguageId);
                formData.append('Hide', values.isEditing ? !values.Safe : isOn ? !values.Safe : false);
                formData.append('Safe', values.Safe);
                formData.append('inputType', inputType);

                const request = id !== undefined
                    ? axios.patch(`https://pslink.world/api/video/update/${id}`, formData)
                    : axios.post('https://pslink.world/api/video/create', formData);

                const res = await request;
                setSubmitting(false);
                resetForm();
                setId(undefined);
                setVideoFileLabel('Video Prank File Upload');
                setSelectedVideoFileName('');
                setCurrentVideoFileName('');
                setVideoUrlText('');
                setInputType('file');
                getData();
                toast.success(res.data.message);
                toggleModal('add');
            } catch (err) {
                console.error(err);
                toast.error(err.response.data.message);
            } finally {
                setIsSubmitting(false);
                setSubmitting(false);
            }
        },
    });


    const handleEdit = (video) => {
        const videoFileName = video.Video.split('/').pop();
        setCurrentVideoFileName(videoFileName);
        setSelectedVideoFileName('');
        setVideoFileLabel('Video Prank File Upload');
        setVideoUrlText(video.Video);

        // Determine input type based on video URL format
        const isUrl = video.Video.startsWith('http');
        setInputType(isUrl ? 'text' : 'file');

        formik.setValues({
            VideoName: video.VideoName,
            ArtistName: video.ArtistName,
            Video: '',
            VideoPremium: video.VideoPremium,
            CategoryId: video.CategoryId,
            LanguageId: video.LanguageId,
            Hide: video.Safe,
            Safe: video.Safe,
            isEditing: true
        });
        setId(video._id);
        toggleModal('edit');
    };

    const handleSafeToggle = (videoId, currentSafeStatus) => {
        axios.patch(`https://pslink.world/api/video/update/${videoId}`, { Safe: !currentSafeStatus, Hide: currentSafeStatus })
            .then((res) => {
                getData();
                toast.success(res.data.message);
            })
            .catch((err) => {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            });
    };

    const handlePremiumToggle = (videoId, currentPremiumStatus) => {
        axios.patch(`https://pslink.world/api/video/update/${videoId}`, { VideoPremium: !currentPremiumStatus })
            .then((res) => {
                getData();
                toast.success(res.data.message);
            })
            .catch((err) => {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            });
    };

    const handleDelete = (videoId) => {
        if (window.confirm("Are you sure you want to delete this Video Prank?")) {
            axios.delete(`https://pslink.world/api/video/delete/${videoId}`)
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

    const handleCopyToClipboard = (video) => {
        if (video?.Video) {
            navigator.clipboard.writeText(video.Video)
                .then(() => {
                    toast.success("Video URL copied to clipboard!");
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
            <div className="dots-loader">
                <span></span><span></span><span></span>
            </div>
        </div>
    );

    return (
        <div>
            <div className='d-sm-flex justify-content-between align-items-center'>
                <div>
                    <h4>Video Prank</h4>
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
                                        className="custom-dropdown-item"
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
                        <FontAwesomeIcon icon={faPlus} className='pe-2' /> Add Video Prank
                    </Button>
                </div>

                <div className="table-responsive px-4">
                    <Table className='text-center fs-6 w-100 bg-white'>
                        <thead>
                            <tr>
                                <td className='py-4' style={{ fontWeight: "600" }}>Id</td>
                                <td className='py-4' style={{ fontWeight: "600" }}>Video Prank Name</td>
                                <td className='py-4' style={{ fontWeight: "600" }}>Artist Name</td>
                                <td className='py-4' style={{ fontWeight: "600" }}>Video Prank File</td>
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
                                currentItems.map((video, index) => (
                                    <tr key={video._id} style={{ borderTop: "1px solid #E4E6E8" }}>
                                        <td>{indexOfFirstItem + index + 1}</td>
                                        <td>{video.VideoName}</td>
                                        <td>{video.ArtistName}</td>
                                        <td className='d-flex2'>
                                            <video controls width="110px" height="110px">
                                                <source src={video.Video} type="video/mp4" />
                                                <track
                                                    kind="captions"
                                                    src={video.VideoName}
                                                    srcLang="en"
                                                    label="English"
                                                    default
                                                />
                                                Your browser does not support the video element.
                                            </video>

                                            <Button
                                                className="edit-dlt-btn text-black"
                                                onClick={() => handleCopyToClipboard(video)}
                                            >
                                                <FontAwesomeIcon icon={faCopy} />
                                            </Button>
                                        </td>
                                        <td>{getLanguageName(video.LanguageId)}</td>
                                        <td>{getCategoryName(video.CategoryId)}</td>
                                        <td>
                                            <Button
                                                className='bg-transparent border-0 fs-4'
                                                style={{ color: video.VideoPremium ? "#0385C3" : "#6c757d" }}
                                                onClick={() => handlePremiumToggle(video._id, video.VideoPremium)}
                                            >
                                                <FontAwesomeIcon
                                                    icon={video.VideoPremium ? faToggleOn : faToggleOff}
                                                    title={video.VideoPremium ? "Premium ON" : "Premium OFF"}
                                                />
                                            </Button>
                                        </td>
                                        <td>
                                            <Button className='bg-transparent border-0 fs-5' style={{ color: "#0385C3" }} onClick={() => handleSafeToggle(video._id, video.Safe)}>
                                                <FontAwesomeIcon icon={video.Safe ? faEye : faEyeSlash} />
                                            </Button>
                                        </td>
                                        <td>
                                            <FontAwesomeIcon
                                                icon={video.trending ? faArrowTrendUp : faArrowTrendDown}
                                                title={video.trending ? "up" : "down"}
                                                className='fs-5'
                                                style={{ color: video.trending ? 'green' : 'red' }}
                                            />
                                        </td>
                                        <td>
                                            <Button className='edit-dlt-btn' style={{ color: "#0385C3" }} onClick={() => handleEdit(video)}>
                                                <FontAwesomeIcon icon={faEdit} />
                                            </Button>
                                            <Button className='edit-dlt-btn text-danger' onClick={() => handleDelete(video._id)}>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={10} className="text-center pb-4">No Data Found</td> {/* Ensure the colSpan matches your table structure */}
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
                onHide={() => !isSubmitting && toggleModal('add')}
                backdrop={isSubmitting ? 'static' : true}
                keyboard={!isSubmitting}
            >
                <Modal.Header>
                    <Modal.Title>{id ? "Edit Video Prank" : "Add Video Prank"}</Modal.Title>
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
                                disabled={isSubmitting}
                                value={formik.values.LanguageId}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
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
                            <Form.Label className='fw-bold'>Video Prank Name ( use searching )<span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>* </span></Form.Label>
                            <Form.Control
                                type="text"
                                id="VideoName"
                                name="VideoName"
                                className='py-2'
                                disabled={isSubmitting}
                                placeholder="Enter Video Prank Name"
                                value={formik.values.VideoName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={formik.touched.VideoName && !!formik.errors.VideoName}
                            />
                            {formik.errors.VideoName && formik.touched.VideoName && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.VideoName}
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
                                disabled={isSubmitting}
                                placeholder="Enter ArtistName"
                                value={formik.values.ArtistName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={formik.touched.ArtistName && !!formik.errors.ArtistName}
                            />
                            {formik.errors.ArtistName && formik.touched.ArtistName && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.ArtistName}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>
                                Video Input Type
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
                                        {videoFileLabel}<span style={{ fontSize: "12px" }}> (15 MB)</span>
                                        <span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>*</span>
                                    </Form.Label>
                                    <div className="d-flex flex-column">
                                        <div className="d-flex align-items-center">
                                            <Form.Control
                                                type="file"
                                                id="Video"
                                                name="Video"
                                                accept="video/mp4,video/x-matroska,video/x-msvideo"
                                                disabled={isSubmitting}
                                                onChange={(event) => {
                                                    const file = event.currentTarget.files[0];
                                                    formik.setFieldValue("Video", file);
                                                    if (file) {
                                                        setVideoFileLabel("Video Prank File uploaded");
                                                        setCurrentVideoFileName(file.name);
                                                    } else {
                                                        setVideoFileLabel("Video Prank File Upload");
                                                        setCurrentVideoFileName('');
                                                    }
                                                    setSelectedVideoFileName(file ? file.name : "");
                                                }}
                                                onBlur={formik.handleBlur}
                                                className="d-none"
                                            />
                                            <label htmlFor="Video" className="btn mb-0 p-4 bg-white w-100 rounded-2" style={{ border: "1px dotted #c1c1c1" }}>
                                                <FontAwesomeIcon icon={faArrowUpFromBracket} style={{ fontSize: "15px" }} />
                                                <div style={{ color: "#c1c1c1" }}>Select Video Prank File</div>
                                                <span style={{ fontSize: "0.8rem", color: "#5E95FE" }}>
                                                    {currentVideoFileName ? currentVideoFileName : selectedVideoFileName}
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <Form.Group>
                                    <Form.Label className='fw-bold'>
                                        Video URL
                                        <span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter video URL (must end with .mp4, .mkv, .avi, etc.)"
                                        value={videoUrlText}
                                        onChange={(e) => {
                                            const newUrl = e.target.value;
                                            setVideoUrlText(newUrl);

                                            if (newUrl) {
                                                formik.setFieldTouched('Video', true, false);
                                                if (!isValidVideoUrl(newUrl)) {
                                                    formik.setFieldError('Video', 'Please provide a valid video URL');
                                                } else {
                                                    formik.setFieldError('Video', undefined);
                                                }
                                            } else {
                                                formik.setFieldError('Video', undefined);
                                            }
                                        }}
                                        isInvalid={formik.touched.Video && !!formik.errors.Video && inputType === 'text'}
                                        isValid={videoUrlText && isValidVideoUrl(videoUrlText)}
                                        disabled={isSubmitting}
                                    />
                                </Form.Group>
                            )}

                            {formik.touched.Video && formik.errors.Video && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.Video}
                                </div>
                            )}
                        </Form.Group>

                        <div className='d-flex flex-wrap gap-sm-4'>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="VideoPremium"
                                    name="VideoPremium"
                                    disabled={isSubmitting}
                                    label="Premium Video Prank"
                                    checked={formik.values.VideoPremium}
                                    onChange={formik.handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="Safe"
                                    name="Safe"
                                    disabled={isSubmitting}
                                    label="Safe Video Prank"
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


            <ToastContainer />
        </div>
    );
};

export default Video;
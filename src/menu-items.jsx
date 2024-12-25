import { faImage } from "@fortawesome/free-regular-svg-icons";
import {faBell, faDharmachakra, faFileAudio, faHome, faLayerGroup, faPhotoFilm, faRectangleAd, faVideo} from "@fortawesome/free-solid-svg-icons";

const menuItems = {
  items: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          type: 'item',
          icon: faHome,
          url: '/dashboard'
        }
      ]
    },
    {
      id: 'Cover Image',
      title: 'Cover Image',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'coverImage',
          title: 'Cover Image',
          type: 'item',
          url: '/cover',
          icon: faImage
        }
      ]
    },
    {
      id: 'Prank Category',
      title: 'Prank Category',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'Prank Category',
          title: 'Prank Category',
          type: 'item',
          url: '/category',
          icon: faLayerGroup
        },
      ]
    },
    {
      id: 'Prank Type',
      title: 'Prank Type',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'audio',
          title: 'Audio Prank',
          type: 'item',
          url: '/type/audio',
          icon: faFileAudio
        },
        {
          id: 'video',
          title: 'Video Prank',
          type: 'item',
          url: '/type/video',
          icon: faVideo
        },
        {
          id: 'gallery',
          title: 'Image Prank',
          type: 'item',
          url: '/type/image',
          icon: faPhotoFilm
        },
      ]
    },
    {
      id: 'Spinner',
      title: 'Spinner',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'Ready Prank',
          title: 'Ready Prank',
          type: 'item',
          url: '/spin/prank',
          icon: faDharmachakra
        }
      ]
    },
    {
      id: 'User',
      title: 'User Upload Prank',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'cover',
          title: 'Cover Image',
          type: 'item',
          url: '/user/cover',
          icon: faImage
        },
        {
          id: 'audio',
          title: 'Audio Prank',
          type: 'item',
          url: '/user/audio',
          icon: faFileAudio
        },
        {
          id: 'video',
          title: 'Video Prank',
          type: 'item',
          url: '/user/video',
          icon: faVideo
        },
        {
          id: 'gallery',
          title: 'Image Prank',
          type: 'item',
          url: '/user/image',
          icon: faPhotoFilm
        },
      ]
    },
    {
      id: 'more',
      title: 'More',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'notification',
          title: 'Auto Notification',
          type: 'item',
          url: '/auto-notification',
          icon: faBell
        },
        {
          id: 'notification',
          title: 'Push Notification',
          type: 'item',
          url: '/push-notification',
          icon: faBell
        },
        {
          id: 'ads',
          title: 'Ads',
          type: 'item',
          url: '/ads',
          icon: faRectangleAd
        }
      ]
    },
  ]
};

export default menuItems;

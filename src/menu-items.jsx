import { faImage } from "@fortawesome/free-regular-svg-icons";
import {faFileAudio, faHome, faLayerGroup, faPhotoFilm, faRectangleAd, faVideo} from "@fortawesome/free-solid-svg-icons";

const menuItems = {
  items: [
    {
      id: 'navigation',
      title: 'Navigation',
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
      id: 'cover',
      title: 'Cover',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'coverImage',
          title: 'Cover-Image',
          type: 'item',
          url: '/cover',
          icon: faImage
        }
      ]
    },
    {
      id: 'Character',
      title: 'Character',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'character',
          title: 'Character',
          type: 'item',
          url: '/character',
          icon: faLayerGroup
        },
      ]
    },
    {
      id: 'Category',
      title: 'Category',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'audio',
          title: 'Audio',
          type: 'item',
          url: '/category/audio',
          icon: faFileAudio
        },
        {
          id: 'video',
          title: 'Video',
          type: 'item',
          url: '/category/video',
          icon: faVideo
        },
        {
          id: 'gallery',
          title: 'Gallery',
          type: 'item',
          url: '/category/gallery',
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

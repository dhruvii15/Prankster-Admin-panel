import { faAndroid, faAppStoreIos, faGoogle, faJs, faMeta } from "@fortawesome/free-brands-svg-icons";
import { faImage } from "@fortawesome/free-regular-svg-icons";
import {faA, faBell, faChartSimple, faFileAudio, faHome, faLayerGroup, faLink, faPhotoFilm, faRectangleAd, faVideo} from "@fortawesome/free-solid-svg-icons";

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
      id: 'before-app-analytics',
      title: 'Before-App-Analytics',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'deeplink',
          title: 'DeepLink',
          type: 'item',
          url: '/deeplink',
          icon: faLink
        },
        {
          id: 'deeplinkanalytics',
          title: 'DeepLink-Analytics',
          type: 'item',
          url: '/analytics',
          icon: faChartSimple
        },
        {
          id: 'meta',
          title: 'Meta',
          type: 'item',
          url: '/meta',
          icon: faMeta
        },
        {
          id: 'google',
          title: 'Google',
          type: 'item',
          url: '/google',
          icon: faGoogle
        },
        {
          id: 'appsFlyer',
          title: 'Appsflyer',
          type: 'item',
          url: '/appsflyer',
          icon: faA
        },
      ]
    },
    {
      id: 'after-app-analytics',
      title: 'After-App-Analytics',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'android',
          title: 'Android',
          type: 'item',
          url: '/android',
          icon: faAndroid
        },
        {
          id: 'ios',
          title: 'IOS',
          type: 'item',
          url: '/ios',
          icon: faAppStoreIos
        },
        {
          id: 'web',
          title: 'Web',
          type: 'item',
          url: '/web',
          icon: faJs
        }
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

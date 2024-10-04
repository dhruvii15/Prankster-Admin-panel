import { faImage } from "@fortawesome/free-regular-svg-icons";
import {faFileAudio, faHome, faLayerGroup, faRectangleAd} from "@fortawesome/free-solid-svg-icons";

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
      id: 'utilities',
      title: 'Utilities',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'cover',
          title: 'Cover',
          type: 'item',
          url: '/cover',
          icon: faImage
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
    {
      id: 'audio',
      title: 'Audio',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'character',
          title: 'Character',
          type: 'item',
          url: '/audio/character',
          icon: faLayerGroup
        },
        {
          id: 'audio',
          title: 'Audio',
          type: 'item',
          url: '/audio/audio',
          icon: faFileAudio
        },
      ]
    },
  ]
};

export default menuItems;

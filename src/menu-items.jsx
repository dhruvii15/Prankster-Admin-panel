import {  faImage } from "@fortawesome/free-regular-svg-icons";
import {faHome, faRectangleAd} from "@fortawesome/free-solid-svg-icons";

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
  ]
};

export default menuItems;

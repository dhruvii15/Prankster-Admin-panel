
import { faAppStore} from "@fortawesome/free-brands-svg-icons";
import { faClipboard, faImage } from "@fortawesome/free-regular-svg-icons";
import {faHome, faInbox, faRectangleAd} from "@fortawesome/free-solid-svg-icons";

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
          id: 'cardtitle',
          title: 'CardTitle',
          type: 'item',
          url: '/cardtitle',
          icon: faClipboard
        },
        {
          id: 'cardBackground',
          title: 'Card-Background',
          type: 'item',
          url: '/cardBackground',
          icon: faImage
        },
        {
          id: 'ads',
          title: 'Ads',
          type: 'item',
          url: '/ads',
          icon: faRectangleAd
        },
        {
          id: 'notificationinbox',
          title: 'Notification Inbox',
          type: 'item',
          url: '/notification-inbox',
          icon: faInbox,
          additionalClass: 'nav-border'
        },
        {
          id: 'moreApp',
          title: 'More App',
          type: 'item',
          url: '/moreApp',
          icon: faAppStore,
          additionalClass: 'nav-border'
        }
      ]
    },
  ]
};

export default menuItems;

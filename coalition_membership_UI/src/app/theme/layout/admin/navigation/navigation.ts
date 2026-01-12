import { Injectable } from "@angular/core";

export interface NavigationItem {
  id: string;
  title: string;
  type: "item" | "collapse" | "group";
  icon?: string;
  url?: string;
  classes?: string;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  role: string;
  children?: Navigation[];
}

export interface Navigation extends NavigationItem {
  children?: NavigationItem[];
}
const NavigationItems = [
  {
    id: "dashboard",
    title: "Dashboard",
    type: "group",
    icon: "icon-navigation",
    children: [
      {
        id: "coalition-dashboard",
        title: "Glory Dashboard",
        type: "item",
        classes: "nav-item",
        role: ["Coalition"],
        url: "/admin",
        icon: "ti ti-dashboard",
        breadcrumbs: false,
      },
      {
        id: "association-dashboard",
        title: "Glory Admin Dashboard",
        type: "item",
        classes: "nav-item",
        role: ["Association"],
        url: "/admin",
        icon: "ti ti-dashboard",
        breadcrumbs: false,
      },
      {
        id: "member-dashboard",
        title: "Member Dashboard",
        type: "item",
        classes: "nav-item",
        role: ["Member"],
        url: "/admin/member-dashboard",
        icon: "ti ti-dashboard",
        breadcrumbs: false,
      },
    ],
  },
  {
    id: "page2",
    title: "Membership",
    type: "group",
    icon: "icon-navigation",
    children: [
      {
        id: "profile",
        title: "Profile",
        type: "item",
        role: ["Member"],
        icon: "ti ti-user-check",
        url: "/admin/members/member-profile",
        breadcrumbs: false,
      },

      {
        id: "Events",
        title: "Events & News",
        type: "item",
        role: ["Member"],
        icon: "ti ti-link",
        url: "/admin/members/member-event",
        breadcrumbs: false,
      },

      {
        id: "manage-association",
        title: "Manage Association",
        type: "item",
        role: ["Coalition"],
        icon: "ti ti-building",
        url: "/admin/coaliation/association",
        breadcrumbs: false,
      },

      {
        id: "manage-admins",
        title: "Manage Admins",
        type: "item",
        role: ["Coalition"],
        icon: "ti ti-users",
        url: "/admin/coaliation/admins",
        breadcrumbs: false,
      },

      {
        id: "regions",
        title: "Regions",
        type: "item",
        role: ["Coalition"],
        icon: "ti ti-map-pin",
        url: "/admin/configuration/location-setting",
        breadcrumbs: false,
      },

      {
        id: "data",
        title: "Members",
        type: "item",
        role: ["Coalition", "Association"],
        icon: "ti ti-users",
        url: "/admin/members/List",
        breadcrumbs: false,
      },
      {
        id: "data",
        title: "Message Management",
        type: "item",
        role: ["Coalition", "Association"],
        icon: "ti ti-message",
        url: "/admin/members/messages",
        breadcrumbs: false,
      },
      {
        id: "data",
        title: "Unsent Messages",
        type: "item",
        role: ["Coalition", "Association"],
        icon: "ti ti-message",
        url: "/admin/members/unsent-messages",
        breadcrumbs: false,
      },
      // {
      //   id: "events-management",
      //   title: "Events Management",
      //   type: "collapse",
      //   role: ["Coalition", "Association"],
      //   icon: "ti ti-calendar",
      //   children: [
      //     {
      //       id: "events",
      //       title: "Events",
      //       type: "item",
      //       role: ["Coalition", "Association"],
      //       url: "/admin/events",
      //       icon: "ti ti-calendar-event",
      //       breadcrumbs: false,
      //     },
      //     {
      //       id: "donation-targets",
      //       title: "Donation Targets",
      //       type: "item",
      //       role: ["Coalition", "Association"],
      //       url: "/admin/donation-targets",
      //       icon: "ti ti-target",
      //       breadcrumbs: false,
      //     },
      //   ],
      // },

      // {
      //   id: "news-management",
      //   title: "News Management",
      //   type: "collapse",
      //   role: ["Coalition"],
      //   icon: "ti ti-news",
      //   children: [
      //   
      //     {
      //       id: "news-approval",
      //       title: "News Approval",
      //       type: "item",
      //       role: ["Coalition"],
      //       url: "/admin/news/approval",
      //       icon: "ti ti-check",
      //       breadcrumbs: false,
      //     },
      //     {
      //       id: "all-news",
      //       title: "All News",
      //       type: "item",
      //       role: ["Coalition"],
      //       url: "/admin/news/all",
      //       icon: "ti ti-list",
      //       breadcrumbs: false,
      //     },
      //   ],
      // },

      // {
      //   id: "news-management",
      //   title: "News Management",
      //   type: "collapse",
      //   role: [ "Association"],
      //   icon: "ti ti-news",
      //   children: [
      //     {
      //       id: "my-news",
      //       title: "My News",
      //       type: "item",
      //       role: ["Association"],
      //       url: "/admin/news/my-news",
      //       icon: "ti ti-file-text",
      //       breadcrumbs: false,
      //     }
      //    
      //   ],
      // },

      {
        id: "reports",
        title: "Reports & Analytics",
        type: "collapse",
        role: ["Coalition", "Association"],
        icon: "ti ti-chart-bar",
        children: [
          // {
          //   id: "comprehensive-reports",
          //   title: "Comprehensive Reports",
          //   type: "item",
          //   role: ["Coalition", "Association"],
          //   url: "/admin/reports",
          //   icon: "ti ti-file-analytics",
          //   breadcrumbs: false,
          // },
          // {
          //   id: "association-reports",
          //   title: "Association Reports",
          //   type: "item",
          //   role: ["Association"],
          //   url: "/reports?scope=association&type=overview",
          //   icon: "ti ti-chart-line",
          //   breadcrumbs: false,
          // },
          {
            id: "legacy-membership-report",
            title: "Legacy Membership Report",
            type: "item",
            role: ["Coalition"],
            url: "/admin/reports/membership-report",
            icon: "ti ti-book",
            breadcrumbs: false,
          },
          {
            id: "legacy-total-revenue",
            title: "Legacy Total Revenue",
            type: "item",
            role: ["Coalition"],
            url: "/admin/reports/total-revenue",
            icon: "ti ti-cash",
            breadcrumbs: false,
          },
        ],
      },

      {
        id: "Authentication",
        title: "Configuration",
        type: "collapse",
        role: ["Association"],
        icon: "ti ti-settings",
        children: [
          {
            id: "membership-types",
            title: "Membership Types",
            type: "item",
            role: ["Association"],
            url: "/admin/configuration/membership-types",
            breadcrumbs: false,
          },
          {
            id: "general-codes",
            title: "General Codes",
            type: "item",
            role: ["Coalition"],
            url: "/admin/configuration/general-codes",
            breadcrumbs: false,
          },

        ],
      },


    ],
  },
];

@Injectable()
export class NavigationItem {
  get() {
    return NavigationItems;
  }
}

require("dotenv").config();
const mongoose = require("mongoose");
const connectMongoDB = require("../../config/mongodb.js");


const seedMongoDB = async () => {
    try {
        await connectMongoDB();
        console.log('Seeding MongoDB...');
        const homeConnection = mongoose.connection.db.collection("home");
        const insertHomeData = [
            {
                "page_slug":"home",
                "page_section":"home_banner",
                "page_content":[
                    {
                        "projimage1":`${process.env.PROJECT_URL}/assets/images/homeani1.webp`,
                        "projimage2":`${process.env.PROJECT_URL}/assets/images/homeani2.webp`,
                    },
                    {
                        "banner_text":`Exceptional service from start to finish! Prethviga Homes
                        | turned our outdated kitchen into a modern masterpiece. Their
                        | team was professional, efficient, and a pleasure to work
                        | with.`,
                        "user_name":"Arun Kumar",
                        "user_role":"Manager, IT Field"
                    },
                    {
                        "banner_text":`Outstanding work! 
                        |They completed our commercial building ahead of schedule and 
                        |the quality exceeded our expectations. Highly professional team.`,
                        "user_name":"John Davidson",
                        "user_role":"CEO, Davidson Enterprises"
                    },
                ]
            },
            {
                "page_slug":"home",
                "page_section":"recent_projects",
                "page_content":[
                    {
                        "card-image":`${process.env.PROJECT_URL}/assets/images/projecthome1.webp`,
                        "project-name":"Pinnacle View Condominiums",
                        "project-area":"East Side",
                        "project-date":"November 2024",
                        "card-footer-text":"24 Premium Apartments",
                    },
                    {
                        "card-image":`${process.env.PROJECT_URL}/assets/images/projecthome2.webp`,
                        "project-name":"Pinnacle View Condominiums",
                        "project-area":"East Side",
                        "project-date":"November 2024",
                        "card-footer-text":"24 Premium Apartments",
                    },
                    {
                        "card-image":`${process.env.PROJECT_URL}/assets/images/projecthome3.webp`,
                        "project-name":"Pinnacle View Condominiums",
                        "project-area":"East Side",
                        "project-date":"November 2024",
                        "card-footer-text":"24 Premium Apartments",
                    },
                ]
            },
            {
                "page_slug":"home",
                "page_section":"home_tech",
                "page_content":[
                    {
                        "technologies-image":`${process.env.PROJECT_URL}assets/images/window.svg`,
                        "technologies-title":"Technologies",
                    },
                    {
                        "tech-name":"Wall",
                        "tech-text":"We use top-tier materials like reinforced composites and sustainable timber, customized for your project and local climate."
                    },
                    {
                        "tech-name":"Roof",
                        "tech-text":"We ensure dry, comfortable, energy-efficient homes with advanced waterproofing, insulation, and cladding for year-round protection."

                    },
                    {
                        "tech-name":"Window",
                        "tech-text":"Our windows offer stunning views, energy efficiency, and security, seamlessly integrating indoor and outdoor living spaces."
                    }
                ]
            },
            {
                "page_slug":"home",
                "page_section":"reviews",
                "page_content":[
                    {
                        "review-title":"Loved by our clients"
                    },
                    {
                        "review-text":"Prethviga Homes transformed our dream into reality. Their attention to detail and commitment to quality is unmatched. Our new home is everything we hoped for and more!",
                        "client-name":"Rajesh Kumar",
                        "client-role":"Homeowner",
                        "review-footer":"Project: Sunset Ridge Residence"
                    },
                    {
                        "review-text":"Working with Prethviga Homes was a seamless experience. They delivered our commercial space on time and within budget. Professional team with excellent communication!",
                        "client-name":"Priya Sharma",
                        "client-role":"Business Owner",
                        "review-footer":"Project: Tech Hub Commercial Plaza"
                    },
                    {
                        "review-text":"I've invested in multiple projects with Prethviga Homes and every time they've exceeded expectations. Their transparency and quality construction make them my go-to builder",
                        "client-name":"Arun Venkatesh",
                        "client-role":"Investor",
                        "review-footer":"Project: Green Valley Apartments"
                    }
                ]
            }

        ]
        const ProjectPageConnection = mongoose.connection.db.collection("ProjectPage");
        const insertProjectPageData=[
            {
                "page_slug":"ProjectPageConnection",
                "page_section":"ongoing-gallery",
                "page_content":[
                    {
                        "card-image":`${process.env.PROJECT_URL}/assets/images/card1.webp`,
                        "project-name":"Pinnacle View Condominiums",
                        "project-location":"West side",
                        "project-date":"November 2024",
                        "card-footer-text":"24 Premium Apartments",
                    },
                    {
                        "card-image":`${process.env.PROJECT_URL}/assets/images/card2.webp`,
                        "project-name":"Serenity Heights Estate",
                        "project-location":"West side",
                        "project-date":"August 2024",
                        "card-footer-text":"24 Premium Apartments",
                    },
                    {
                        "card-image":`${process.env.PROJECT_URL}/assets/images/card3.webp`,
                        "project-name":"Grandview Manor Residences",
                        "project-location":"South End",
                        "project-date":"September 2024",
                        "card-footer-text":"24 Premium Apartments",
                    },
                    {
                        "card-image":`${process.env.PROJECT_URL}/assets/images/card4.webp`,
                        "project-name":"Pinnacle View Condominiums",
                        "project-location":"East Side",
                        "project-date":"November 2024 2024",
                        "card-footer-text":"24 Premium Apartments",
                    },
                    {
                        "card-image":`${process.env.PROJECT_URL}/assets/images/card1.webp`,
                        "project-name":"Pinnacle View Condominiums",
                        "project-location":"East Side",
                        "project-date":"November 2024 2024",
                        "card-footer-text":"24 Premium Apartments",
                    },
                    {
                        "card-image":`${process.env.PROJECT_URL}/assets/images/card4.webp`,
                        "project-name":"Pinnacle View Condominiums",
                        "project-location":"East Side",
                        "project-date":"November 2024 2024",
                        "card-footer-text":"24 Premium Apartments",
                    }
                ]
            },
            {
                "page_slug":"ProjectPageConnection",
                "page_section":"completed-gallery",
                "page_content":[
                    {
                        "card-image":`${process.env.PROJECT_URL}/assets/images/card2.webp`,
                        "project-name":"Pinnacle View Condominiums",
                        "project-location":"West side",
                        "project-date":"November 2024",
                        "card-footer-text":"24 Premium Apartments",
                    },
                    {
                        "card-image":`${process.env.PROJECT_URL}/assets/images/card3.webp`,
                        "project-name":"Serenity Heights Estate",
                        "project-location":"West side",
                        "project-date":"August 2024",
                        "card-footer-text":"24 Premium Apartments",
                    },
                    {
                        "card-image":`${process.env.PROJECT_URL}/assets/images/card4.webp`,
                        "project-name":"Grandview Manor Residences",
                        "project-location":"South End",
                        "project-date":"September 2024",
                        "card-footer-text":"24 Premium Apartments",
                    },
                    {
                        "card-image":`${process.env.PROJECT_URL}/assets/images/card3.webp`,
                        "project-name":"Pinnacle View Condominiums",
                        "project-location":"East Side",
                        "project-date":"November 2024 2024",
                        "card-footer-text":"24 Premium Apartments",
                    },
                    {
                        "card-image":`${process.env.PROJECT_URL}/assets/images/card3.webp`,
                        "project-name":"Pinnacle View Condominiums",
                        "project-location":"East Side",
                        "project-date":"November 2024 2024",
                        "card-footer-text":"24 Premium Apartments",
                    },
                    {
                        "card-image":`${process.env.PROJECT_URL}/assets/images/card2.webp`,
                        "project-name":"Pinnacle View Condominiums",
                        "project-location":"East Side",
                        "project-date":"November 2024 2024",
                        "card-footer-text":"24 Premium Apartments",
                    }
                ]

            }
        ]
        const OnGoingPageConnection = mongoose.connection.db.collection("OnGoingPage");
        const insertOnGoingPageData = [
            {
                page_slug: "OnGoingPage",
                page_section: "features-grid",
                page_content: [
                    {
                        fc_heading: "Premium Quality",
                        fc_description: "High-quality materials and superior craftsmanship ensuring lasting value",
                        svg: {
                            width: 19,
                            height: 30,
                            viewBox: "0 0 19 30",
                            path: "M13.969 15.8533L15.989 27.2213C16.0116 27.3552 15.9928 27.4928 15.9352 27.6157C15.8775 27.7386 15.7837 27.8409 15.6662 27.9091C15.5488 27.9772 15.4134 28.0079 15.2781 27.997C15.1428 27.986 15.014 27.9341 14.909 27.848L10.1357 24.2653C9.90523 24.0932 9.62531 24.0002 9.33767 24.0002C9.05003 24.0002 8.7701 24.0932 8.53967 24.2653L3.75833 27.8467C3.65343 27.9326 3.52482 27.9845 3.38966 27.9954C3.25451 28.0063 3.11923 27.9758 3.00189 27.9078C2.88454 27.8399 2.7907 27.7378 2.73289 27.6151C2.67508 27.4925 2.65605 27.3551 2.67833 27.2213L4.697 15.8533M17.333 9.33333C17.333 13.7516 13.7513 17.3333 9.33301 17.3333C4.91473 17.3333 1.33301 13.7516 1.33301 9.33333C1.33301 4.91505 4.91473 1.33333 9.33301 1.33333C13.7513 1.33333 17.333 4.91505 17.333 9.33333Z"
                        }
                    },
                    {
                        fc_heading: "Community Living",
                        fc_description: "High-quality materials and superior craftsmanship ensuring lasting value",
                        svg: {
                            width: 30,
                            height: 27,
                            viewBox: "0 0 30 27",
                            path: "M19.9997 25.3333V22.6667C19.9997 21.2522 19.4378 19.8956 18.4376 18.8954C17.4374 17.8952 16.0808 17.3333 14.6663 17.3333H6.66634C5.25185 17.3333 3.8953 17.8952 2.89511 18.8954C1.89491 19.8956 1.33301 21.2522 1.33301 22.6667V25.3333M19.9997 1.50406C21.1433 1.80056 22.1562 2.46842 22.8792 3.40281C23.6023 4.33721 23.9946 5.48525 23.9946 6.66673C23.9946 7.84821 23.6023 8.99625 22.8792 9.93065C22.1562 10.865 21.1433 11.5329 19.9997 11.8294M27.9997 25.3333V22.6667C27.9988 21.485 27.6055 20.337 26.8815 19.4031C26.1575 18.4691 25.1438 17.8021 23.9997 17.5067M15.9997 6.66666C15.9997 9.61218 13.6119 12 10.6663 12C7.72082 12 5.33301 9.61218 5.33301 6.66666C5.33301 3.72114 7.72082 1.33333 10.6663 1.33333C13.6119 1.33333 15.9997 3.72114 15.9997 6.66666Z"
                        }
                    },
                    {
                        fc_heading: "Spacious Design",
                        fc_description: "High-quality materials and superior craftsmanship ensuring lasting value",
                        svg: {
                            width: 27,
                            height: 27,
                            viewBox: "0 0 27 27",
                            path: "M17.333 1.33334H25.333M25.333 1.33334V9.33334M25.333 1.33334L15.9997 10.6667M1.33301 25.3333L10.6663 16M1.33301 25.3333L9.33301 25.3333M1.33301 25.3333V17.3333"
                        }
                    },
                    {
                        fc_heading: "Modern Architecture",
                        fc_description: "High-quality materials and superior craftsmanship ensuring lasting value",
                        svg: {
                                width: 30,
                                height: 30,
                                viewBox: "0 0 30 30",
                                path: "M6.66634 28V4.00001C6.66634 3.29277 6.94729 2.61449 7.44739 2.11439C7.94749 1.61429 8.62576 1.33334 9.33301 1.33334H19.9997C20.7069 1.33334 21.3852 1.61429 21.8853 2.11439C22.3854 2.61449 22.6663 3.29277 22.6663 4.00001V28M6.66634 28H22.6663M6.66634 28L3.99967 28C3.29243 28 2.61415 27.7191 2.11406 27.219C1.61396 26.7189 1.33301 26.0406 1.33301 25.3333V17.3333C1.33301 16.6261 1.61396 15.9478 2.11406 15.4477C2.61415 14.9476 3.29243 14.6667 3.99967 14.6667H6.66634M22.6663 28L25.333 28C26.0403 28 26.7185 27.7191 27.2186 27.219C27.7187 26.7189 27.9997 26.0406 27.9997 25.3333V13.3333C27.9997 12.6261 27.7187 11.9478 27.2186 11.4477C26.7185 10.9476 26.0403 10.6667 25.333 10.6667H22.6663M11.9997 6.66668H17.333M11.9997 12H17.333M11.9997 17.3333H17.333M11.9997 22.6667H17.333"
                        }
                    }
                ]
            },
            {
                "page_slug":"OnGoingPage",
                "page_section":"amenities-list",
                "page_content":[
                    {
                        svg: {
                                width: 26,
                                height: 26,
                                viewBox: "0 0 26 26",
                                path: "M1 17C2.33333 17 3.66667 18.3333 5 18.3333C6.33333 18.3333 7.6667 17 9 17C10.3333 17 11.6667 18.3333 13 18.3333C14.3333 18.3333 15.6667 17 17 17C18.3333 17 19.6667 18.3333 21 18.3333C22.3333 18.3333 23.6667 17 25 17M1 23C2.33333 23 3.66667 24.3333 5 24.3333C6.33333 24.3333 7.6667 23 9 23C10.3333 23 11.6667 24.3333 13 24.3333C14.3333 24.3333 15.6667 23 17 23C18.3333 23 19.6667 24.3333 21 24.3333C22.3333 24.3333 23.6667 23 25 23M21 9L25 13M17 1C19.2091 1 21 2.79086 21 5C21 7.2091 19.2091 9 17 9C14.7909 9 13 7.2091 13 5C13 2.79086 14.7909 1 17 1Z"
                        },
                        "feature": "Swimming Pool"
                    },
                    {
                        svg: {
                                width: 20,
                                height: 16,
                                viewBox: "0 0 21 21",
                                path: "M13 1V3M13 7V9M13 13V15M3 1H17C17.5304 1 18.0391 1.21071 18.4142 1.58579C18.7893 1.96086 19 2.46957 19 3V6C18.4696 6 17.9609 6.21071 17.5858 6.58579C17.2107 6.96086 17 7.46957 17 8C17 8.53043 17.2107 9.03914 17.5858 9.41421C17.9609 9.78929 18.4696 10 19 10V13C19 13.5304 18.7893 14.0391 18.4142 14.4142C18.0391 14.7893 17.5304 15 17 15H3C2.46957 15 1.96086 14.7893 1.58579 14.4142C1.21071 14.0391 1 13.5304 1 13V10C1.53043 10 2.03914 9.78929 2.41421 9.41421C2.78929 9.03914 3 8.53043 3 8C3 7.46957 2.78929 6.96086 2.41421 6.58579C2.03914 6.21071 1.53043 6 1 6V3C1 2.46957 1.21071 1.96086 1.58579 1.58579C1.96086 1.21071 2.46957 1 3 1Z"
                        },
                        "feature": "Theater"
                    },
                    {
                        svg: {
                                width: 26,
                                height: 10,
                                viewBox: "0 0 21 21",
                                path: "M3 5H23M3 1V9M23 1V9M1 3V7M25 3V7M7 3V7M19 3V7"
                        },
                        "feature": "Fitness Center"
                    },
                    {
                        svg: {
                                width: 26,
                                height: 22,
                                viewBox: "0 0 21 21",
                                path: "M11 6V5C10.4477 5 10 5.44772 10 6H11ZM15 11.835V12.835C15.1075 12.835 15.2143 12.8176 15.3162 12.7836L15 11.835ZM11 11.335L11.2425 10.3648C10.9438 10.2901 10.6273 10.3572 10.3846 10.5468C10.1419 10.7363 10 11.027 10 11.335H11ZM10 16C10 16.5523 10.4477 17 11 17C11.5523 17 12 16.5523 12 16H11H10ZM13 11.835L12.7575 12.8051C12.8368 12.8249 12.9182 12.835 13 12.835V11.835ZM3 1V2H23V1V0H3V1ZM23 1V2C23.5523 2 24 2.44771 24 3H25H26C26 1.34315 24.6569 0 23 0V1ZM25 3H24V19H25H26V3H25ZM25 19H24C24 19.5523 23.5523 20 23 20V21V22C24.6569 22 26 20.6569 26 19H25ZM23 21V20H3V21V22H23V21ZM3 21V20C2.44771 20 2 19.5523 2 19H1H0C0 20.6569 1.34315 22 3 22V21ZM1 19H2V3H1H0V19H1ZM1 3H2C2 2.44772 2.44772 2 3 2V1V0C1.34315 0 0 1.34315 0 3H1ZM11 6V7H13V6V5H11V6ZM13 6V7C13.3365 7 13.9124 7.15507 14.4051 7.4465C14.6428 7.58703 14.8119 7.73109 14.9113 7.85314C15.01 7.97423 15 8.02123 15 8H16H17C17 7.42647 16.7531 6.94732 16.4618 6.58985C16.1714 6.23335 15.7976 5.94644 15.4233 5.72505C14.6922 5.29263 13.7681 5 13 5V6ZM16 8H15C15 8.31806 15.036 8.7303 15.0567 9.05774C15.0795 9.42047 15.0909 9.75863 15.0659 10.062C15.0127 10.7067 14.8413 10.8338 14.6838 10.8863L15 11.835L15.3162 12.7836C16.6587 12.3361 16.9873 11.0981 17.0591 10.2264C17.0966 9.77162 17.0767 9.31383 17.0527 8.93206C17.0265 8.51502 17 8.23424 17 8H16ZM11 11.335H10V16H11H12V11.335H11ZM11 6H10V11.135H11H12V6H11ZM11 11.135H10V16H11H12V11.135H11ZM15 11.835V10.835H13V11.835V12.835H15V11.835ZM13 11.835L13.2425 10.8648L11.2425 10.3648L11 11.335L10.7575 12.3051L12.7575 12.8051L13 11.835Z"
                        },
                        "feature": "Parking"
                    },
                    {
                        svg: {
                                width: 19,
                                height: 20,
                                viewBox: "0 0 19 20",
                                path: "M1 15L6 16L6.75 14.5M12 19V15L8 12L9 6M9 6L4 7V10M9 6L12 9L15 10M9 2C9 2.26522 9.10536 2.51957 9.29289 2.70711C9.48043 2.89464 9.73478 3 10 3C10.2652 3 10.5196 2.89464 10.7071 2.70711C10.8946 2.51957 11 2.26522 11 2C11 1.73478 10.8946 1.48043 10.7071 1.29289C10.5196 1.10536 10.2652 1 10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289C9.10536 1.48043 9 1.73478 9 2ZM17.5 18C17.6326 18 17.7598 17.9473 17.8536 17.8536C17.9473 17.7598 18 17.6326 18 17.5C18 17.3674 17.9473 17.2402 17.8536 17.1464C17.7598 17.0527 17.6326 17 17.5 17C17.3674 17 17.2402 17.0527 17.1464 17.1464C17.0527 17.2402 17 17.3674 17 17.5C17 17.6326 17.0527 17.7598 17.1464 17.8536C17.2402 17.9473 17.3674 18 17.5 18Z"
                        },
                        "feature": "Playground"
                    },
                    {
                        svg: {
                                width: 21,
                                height: 21,
                                viewBox: "0 0 21 21",
                                path: "M7 19V13C7 12.4696 7.21071 11.9609 7.58579 11.5858C7.96086 11.2107 8.46957 11 9 11H10.341M17.682 8.682L10 1L1 10H3V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19H10M20 14C20 18 17.5 20 16.5 20C15.5 20 13 18 13 14C14 14 15.5 13.5 16.5 12.5C17.5 13.5 19 14 20 14Z"
                        },
                        "feature": "24/7 Security"
                    }
                ]
            },
            {
                "page_slug":"OnGoingPage",
                "page_section":"location-section",
                "page_content":[
                    {
                        "location-image": `${process.env.PROJECT_URL}assets/images/Rectangle.webp`
                    },
                    {
                        svg: {
                                width: 21,
                                height: 21,
                                viewBox: "0 0 21 21",
                                path: "M17 9C17 13.993 11.461 19.193 9.601 20.799C9.42772 20.9293 9.2168 20.9998 9 20.9998C8.7832 20.9998 8.57228 20.9293 8.399 20.799C6.539 19.193 1 13.993 1 9C1 6.87827 1.84285 4.84344 3.34315 3.34315C4.84344 1.84285 6.87827 1 9 1C11.1217 1 13.1566 1.84285 14.6569 3.34315C16.1571 4.84344 17 6.87827 17 9Z",
                                path: "M9 12C10.6569 12 12 10.6569 12 9C12 7.34315 10.6569 6 9 6C7.34315 6 6 7.34315 6 9C6 10.6569 7.34315 12 9 12Z"
                        },
                        "address": "Address",
                        "add_text": "Avinashi Road, Coimbatore - 641018"
                    },
                    {
                        svg: {
                                width: 21,
                                height: 21,
                                viewBox: "0 0 21 21",
                                path: "M5 21V3C5 2.46957 5.21071 1.96086 5.58579 1.58579C5.96086 1.21071 6.46957 1 7 1H15C15.5304 1 16.0391 1.21071 16.4142 1.58579C16.7893 1.96086 17 2.46957 17 3V21M5 21H17M5 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V13C1 12.4696 1.21071 11.9609 1.58579 11.5858C1.96086 11.2107 2.46957 11 3 11H5M17 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19V10C21 9.46957 20.7893 8.96086 20.4142 8.58579C20.0391 8.21071 19.5304 8 19 8H17M9 5H13M9 9H13M9 13H13M9 17H13"
                        },
                        "landmarks": "Nearby Landmarks"
                    },
                    {
                        "list": "2 km from City Center"
                    },
                    {
                        "list": "5 min to Schools &amp; Hospitals"
                    },
                    {
                        "list": "10 min to Shopping Malls"
                    },
                    {
                        "list": "Easy access to IT Parks"
                    },
                    {
                        svg: {
                                width: 21,
                                height: 21,
                                viewBox: "0 0 21 21",
                                path: "M17 1L6 12L1 7"
                        },
                        "connect": "Connectivity",
                        "c_text": "Well-connected by major roads and public transport with easy access to highways"
                    }
                ]
            },
            {
                "page_slug":"OnGoingPage",
                "page_section":"faq-section-header",
                "page_content":[
                    {
                        "question": "How long does a typical construction project take?",
                        "answer": `The duration varies based on project complexity and scale. Residential projects
                        | typically take 8-14 months, while commercial developments may require 12-24 months. We
                        | provide detailed timelines during project planning.`,
                    },
                    {
                        "question": "What types of projects do you specialize in?",
                        "answer": `We specialize in residential condominiums, luxury estates, commercial buildings, and
                        | mixed-use developments. Our portfolio includes projects ranging from boutique apartments
                        | to large-scale residential complexes.`,
                    },
                    {
                        "question": "Do you offer warranties on completed projects?",
                        "answer": `Yes, all our projects come with comprehensive warranties covering structural integrity,
                        | workmanship, and materials. We offer 10-year structural warranties and 2-year warranties
                        | on finishes and fittings.`,
                    }
                ]
            },
        ]
        const dicoverUsConnection = mongoose.connection.db.collection("discoverUs");
        const insertdiscoverUsData = [
            // {
            //     "page_slug":"discoverUs",
            //     "page_section":"about-content",
            //     "page_content":[
            //         {
            //             "about-content__image": `${process.env.PROJECT_URL}assets/images/discover.webp`,
            //             "about-content__title": "Building Dreams Since Inception",
            //             "about-content__description": `Prethviga Homes is a leading construction company dedicated to 
            //             | transforming visions into reality. With years of experience in 
            //             | residential and commercial construction, we've built a reputation for 
            //             | excellence, innovation, and reliability.`
            //         },
            //     ]
            // },
            {
                "page_slug":"discoverUs",
                "page_section":"our-values",
                "page_content":[
                    {
                        "card-head": "Integrity",
                        "description-text":`We uphold the highest standards of honesty and transparency in
                        | every interaction and decision.`,
                    },
                    {
                        "card-head": "Excellence",
                        "description-text":`We strive for perfection in every project, ensuring superior
                        | quality and attention to detail.`,
                    },
                    {
                        "card-head": "Customer First",
                        "description-text":`We uphold the highest standards of honesty and transparency in
                        | every interaction and decision.`,
                    },
                ]
            },
            // {
            //     "page_slug":"discoverUs",
            //     "page_section":"buyer-container",
            //     "page_content":[
            //         {
            //             "container-title": "Buyer&apos;s Guide",
            //             "container-description": `Use this holistic checklist to ensure your new home meets all your
            //             | needs for comfort, security, and long-term value.`,
            //         },
            //         {
            //             "row-text": 1,
            //             "row-description": "Location &amp; Connectivity",
            //         },
            //         {
            //             "row-text": 2,
            //             "row-description": "Legal Verification",
            //         },
            //         {
            //             "row-text": 3,
            //             "row-description": "Peaceful Living Environment",
            //         },
            //         {
            //             "row-text": 4,
            //             "row-description": "Sustainable Features",
            //         },
            //         {
            //             "row-text": 5,
            //             "row-description": "Amenities &amp; Lifestyle",
            //         },
            //         {
            //             "row-text": 6,
            //             "row-description": "Investment &amp; Budget",
            //         },
            //     ]
            // },
            {
                "page_slug":"discoverUs",
                "page_section":"blogs-section",
                "page_content":[
                    {
                        "blogs-text": "Latest Insights &amp; Updates",
                        "blogs-descrip": `Stay informed with our latest articles on construction trends,
                        | tips, and industry insights from our expert team.`,
                    },
                    {
                        "blogs-img-inner": `${process.env.PROJECT_URL}assets/images/blog1.webp`,
                        "badge-text": "Sustainability",
                        "cards-textses": `November 15, 2025`,
                        "cards-times": "4 min read",
                        "headings-texts": "Innovative Materials Revolutionizing Construction",
                        "cardses-text": `Explore cutting-edge materials that enhance structural
                        | integrity and reduce costs in modern building projects.`,
                    },
                    {
                        "blogs-img-inner": `${process.env.PROJECT_URL}assets/images/blog2.webp`,
                        "badge-text": "Sustainability",
                        "cards-textses": `November 15, 2025`,
                        "cards-times": "4 min read",
                        "headings-texts": "Top 10 Sustainable Building Practices for 2025",
                        "cardses-text": `Explore cutting-edge materials that enhance structural
                        | integrity and reduce costs in modern building projects.`,
                    },
                    {
                        "blogs-img-inner": `${process.env.PROJECT_URL}assets/images/proimage5.webp`,
                        "badge-text": "Sustainability",
                        "cards-textses": `November 15, 2025`,
                        "cards-times": "4 min read",
                        "headings-texts": "Eco-Friendly Construction: The Future of Home Building",
                        "cardses-text": `Explore cutting-edge materials that enhance structural
                        | integrity and reduce costs in modern building projects.`,
                    },
                ]
            }
        ]
        // Clear existing data to prevent duplicates
        await homeConnection.deleteMany({});
        await ProjectPageConnection.deleteMany({});
        await OnGoingPageCollection.deleteMany({});
        await discoverUsCollection.deleteMany({});
        
        // Insert fresh data
        await homeConnection.insertMany(insertHomeData);
        await ProjectPageConnection.insertMany(insertProjectPageData);
        await OnGoingPageConnection.insertMany(insertOnGoingPageData);
        await dicoverUsConnection.insertMany(insertdiscoverUsData);
        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};
seedMongoDB();
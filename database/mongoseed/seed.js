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
                "page_slug":"OnGoingPage",
                "page_section":"features-grid",
                "page_content":[
                    {
                        "fc_heading1": "Premium Quality",
                        "fc_description1": "High-quality materials and superior craftsmanship ensuring lasting value",
                        "fc_heading2": "Community Living",
                        "fc_description2": "High-quality materials and superior craftsmanship ensuring lasting value",
                        "fc_heading3": "Spacious Design",
                        "fc_description3": "High-quality materials and superior craftsmanship ensuring lasting value",
                        "fc_heading4": "Modern Architecture",
                        "fc_description4": "High-quality materials and superior craftsmanship ensuring lasting value"
                    }
                ]
            },
            {
                "page_slug":"OnGoingPage",
                "page_section":"project-planning-container",
                "page_content":[
                    {
                        "feature": "Swimming Pool",
                        "feature1": "Theater",
                        "feature2": "Fitness Center",
                        "feature3": "Parking",
                        "feature4": "Playground",
                        "feature5": "24/7 Security",
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
                        "address": "Address",
                        "add_text": "Avinashi Road, Coimbatore - 641018",
                    },
                    {
                        "landmarks": "Nearby Landmarks",
                        "list1": "2 km from City Center",
                        "list2": "5 min to Schools &amp; Hospitals",
                        "list3": "10 min to Shopping Malls",
                        "list4": "Easy access to IT Parks"
                    },
                    {
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
                        "question1": "How long does a typical construction project take?",
                        "answer1": `The duration varies based on project complexity and scale. Residential projects
                        | typically take 8-14 months, while commercial developments may require 12-24 months. We
                        | provide detailed timelines during project planning.`,
                    },
                    {
                        "question2": "What types of projects do you specialize in?",
                        "answer2": `We specialize in residential condominiums, luxury estates, commercial buildings, and
                        | mixed-use developments. Our portfolio includes projects ranging from boutique apartments
                        | to large-scale residential complexes.`,
                    },
                    {
                        "question3": "Do you offer warranties on completed projects?",
                        "answer3": `Yes, all our projects come with comprehensive warranties covering structural integrity,
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
        // await Connection.deleteMany({});
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
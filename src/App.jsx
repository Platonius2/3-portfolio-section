import React from 'react'
import styled from 'styled-components'

const MainContainer = styled.div`
    min-height: 100vh;
    display: flex;
    align-items: center;
    padding: 2rem;
`;

const ContentWrapper = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 4rem;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;

    @media (max-width: 1024px) {
        grid-template-columns: 1.5fr 1fr;
        gap: 2rem;
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 3rem;
    }
`;

const LogoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4rem;
    padding: 0 1rem;

    @media (max-width: 1200px) {
        gap: 3rem;
    }

    @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 2rem;
    }

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
        max-width: 300px;
        margin: 0 auto;
    }
`;

const TitleSection = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;

    @media (max-width: 768px) {
        order: -1;
        text-align: center;
    }
`;

const Title = styled.h1`
    font-family: 'Clash Display', sans-serif;
    color: #ffffff;
    font-size: clamp(2.5rem, 5vw, 4.5rem);
    font-weight: 900;
    line-height: 1.1;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    position: relative;
    text-align: right;

    @media (max-width: 768px) {
        text-align: center;
    }

    span {
        display: block;
        font-size: clamp(1rem, 2vw, 1.5rem);
        font-weight: 400;
        color: #ffffff;
        text-transform: none;
        margin-top: 1rem;
        letter-spacing: normal;
    }
`;

const LogoContainer = styled.a`
    aspect-ratio: 1;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    text-decoration: none;
    cursor: pointer;
    padding: 1rem;

    &:hover {
        transform: scale(1.1);
    }

    img {
        max-width: 80%;
        max-height: 80%;
        object-fit: contain;
        filter: grayscale(100%);
        opacity: 0.7;
        transition: all 0.3s ease;
    }

    &:hover img {
        filter: grayscale(0%);
        opacity: 1;
    }

    @media (max-width: 480px) {
        max-width: 200px;
        margin: 0 auto;
    }
`;

const CompanyName = styled.span`
    position: absolute;
    bottom: -2rem;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: all 0.3s ease;
    background-color: #333;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-size: clamp(0.8rem, 1.5vw, 0.9rem);
    white-space: nowrap;

    ${LogoContainer}:hover & {
        opacity: 1;
        bottom: -1rem;
    }
`;

const ClientLogos = () => {
    const logos = [
        {
            name: 'Google',
            url: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
            website: 'https://www.google.com'
        },
        {
            name: 'Microsoft',
            url: 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31',
            website: 'https://www.microsoft.com'
        },
        {
            name: 'Apple',
            url: 'https://www.apple.com/ac/globalnav/7/en_US/images/be15095f-5a20-57d0-ad14-cf4c638e223a/globalnav_apple_image__b5er5ngrzxqq_large.svg',
            website: 'https://www.apple.com'
        },
        {
            name: 'Amazon',
            url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
            website: 'https://www.amazon.com'
        },
        {
            name: 'Meta',
            url: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
            website: 'https://about.meta.com'
        },
        {
            name: 'Netflix',
            url: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
            website: 'https://www.netflix.com'
        }
    ];

    return (
        <section>
            <LogoGrid>
                {logos.map((logo) => (
                    <LogoContainer 
                        key={logo.name} 
                        href={logo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img src={logo.url} alt={`${logo.name} logo`} />
                        <CompanyName>{logo.name}</CompanyName>
                    </LogoContainer>
                ))}
            </LogoGrid>
        </section>
    );
};

const App = () => {
    return (
        <MainContainer>
            <ContentWrapper>
                <ClientLogos />
                <TitleSection>
                    <Title>
                        Our Clients
                        <span>Trusted by the best</span>
                    </Title>
                </TitleSection>
            </ContentWrapper>
        </MainContainer>
    );
};

export default App; 
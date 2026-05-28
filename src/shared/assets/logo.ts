import logoImage from '@/shared/assets/logo.png';

const logo = typeof logoImage === 'string' ? logoImage : logoImage.src;

export default logo;

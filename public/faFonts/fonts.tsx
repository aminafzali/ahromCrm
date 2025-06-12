import localFont from "next/font/local";
export const shabnamFont = localFont({
    src:[
        {
            path: './shabnam/Shabnam.woff2',
            weight: '400',
            style: 'normal',
        },
        {
            path: './shabnam/Shabnam-Bold.woff2',
            weight: '400',
            style: 'bold',
        },
    ]
})
export const shabnamFontFD = localFont({
    src:[
        {
            path: './shabnamFD/Shabnam-FD.eot',
            weight: '400',
            style: 'normal',
        },
        {
            path: './shabnamFD/Shabnam-FD.woff2',
            weight: '400',
            style: 'bold',
        },
        {
            path: './shabnamFD/Shabnam-FD.woff',
            weight: '400',
            style: 'bold',
        },
        {
            path: './shabnamFD/Shabnam-FD.ttf',
            weight: '400',
            style: 'bold',
        },
    ],
    variable: '--font-shabnam',
})

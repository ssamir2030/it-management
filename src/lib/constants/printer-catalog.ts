
export interface PrinterModel {
    id: string
    name: string
    code: string
    toners: InkToner[]
}

export interface InkToner {
    id: string
    name: string // e.g., "HP 85A Black"
    code: string // e.g., "CE285A"
    color: 'Black' | 'Cyan' | 'Magenta' | 'Yellow' | 'Color'
}

export interface PrinterBrand {
    name: string
    logo?: string // Lucide icon name or path
    models: PrinterModel[]
}

export const PRINTER_CATALOG: Record<'PRINTER' | 'COPIER', PrinterBrand[]> = {
    PRINTER: [
        {
            name: 'HP',
            models: [
                {
                    id: 'hp-m404', name: 'LaserJet Pro M404dn', code: 'M404dn',
                    toners: [
                        { id: 'hp-58a', name: 'HP 58A Black', code: 'CF258A', color: 'Black' },
                        { id: 'hp-58x', name: 'HP 58X High Yield', code: 'CF258X', color: 'Black' }
                    ]
                },
                {
                    id: 'hp-p1102', name: 'LaserJet P1102', code: 'P1102',
                    toners: [
                        { id: 'hp-85a', name: 'HP 85A Black', code: 'CE285A', color: 'Black' }
                    ]
                },
                {
                    id: 'hp-m454', name: 'Color LaserJet Pro M454dn', code: 'M454dn',
                    toners: [
                        { id: 'hp-415a-blk', name: 'HP 415A Black', code: 'W2030A', color: 'Black' },
                        { id: 'hp-415a-cyn', name: 'HP 415A Cyan', code: 'W2031A', color: 'Cyan' },
                        { id: 'hp-415a-yel', name: 'HP 415A Yellow', code: 'W2032A', color: 'Yellow' },
                        { id: 'hp-415a-mag', name: 'HP 415A Magenta', code: 'W2033A', color: 'Magenta' },
                    ]
                }
            ]
        },
        {
            name: 'Canon',
            models: [
                {
                    id: 'canon-lbp6030', name: 'i-SENSYS LBP6030B', code: 'LBP6030',
                    toners: [
                        { id: 'canon-725', name: 'Canon 725 Black', code: '3484B002', color: 'Black' }
                    ]
                }
            ]
        },
        {
            name: 'Epson',
            models: [
                {
                    id: 'epson-l3150', name: 'EcoTank L3150', code: 'L3150',
                    toners: [
                        { id: 'epson-103-bk', name: 'Epson 103 Black', code: 'C13T00S14A', color: 'Black' },
                        { id: 'epson-103-c', name: 'Epson 103 Cyan', code: 'C13T00S24A', color: 'Cyan' },
                        { id: 'epson-103-m', name: 'Epson 103 Magenta', code: 'C13T00S34A', color: 'Magenta' },
                        { id: 'epson-103-y', name: 'Epson 103 Yellow', code: 'C13T00S44A', color: 'Yellow' },
                    ]
                }
            ]
        }
    ],
    COPIER: [
        {
            name: 'Xerox',
            models: [
                {
                    id: 'xerox-3335', name: 'WorkCentre 3335', code: 'WC3335',
                    toners: [
                        { id: 'xerox-106r036', name: 'Xerox 106R03621', code: '106R03621', color: 'Black' }
                    ]
                },
                {
                    id: 'xerox-altalink', name: 'AltaLink C8030', code: 'C8030',
                    toners: [
                        { id: 'xerox-006r01', name: 'Black Toner', code: '006R01697', color: 'Black' },
                        { id: 'xerox-006r02', name: 'Cyan Toner', code: '006R01698', color: 'Cyan' },
                        { id: 'xerox-006r03', name: 'Magenta Toner', code: '006R01699', color: 'Magenta' },
                        { id: 'xerox-006r04', name: 'Yellow Toner', code: '006R01700', color: 'Yellow' },
                    ]
                }
            ]
        },
        {
            name: 'Konica Minolta',
            models: [
                {
                    id: 'konica-c258', name: 'bizhub C258', code: 'C258',
                    toners: [
                        { id: 'tn324k', name: 'TN-324K Black', code: 'A8DA150', color: 'Black' },
                        { id: 'tn324c', name: 'TN-324C Cyan', code: 'A8DA450', color: 'Cyan' },
                        { id: 'tn324m', name: 'TN-324M Magenta', code: 'A8DA350', color: 'Magenta' },
                        { id: 'tn324y', name: 'TN-324Y Yellow', code: 'A8DA250', color: 'Yellow' },
                    ]
                },
                {
                    id: 'konica-accuario', name: 'AccurioPrint C3070L', code: 'C3070L',
                    toners: [
                        { id: 'tn619k', name: 'TN-619K Black', code: 'A3VX150', color: 'Black' },
                        { id: 'tn619c', name: 'TN-619C Cyan', code: 'A3VX450', color: 'Cyan' },
                        { id: 'tn619m', name: 'TN-619M Magenta', code: 'A3VX350', color: 'Magenta' },
                        { id: 'tn619y', name: 'TN-619Y Yellow', code: 'A3VX250', color: 'Yellow' },
                    ]
                }
            ]
        },
        {
            name: 'Ricoh',
            models: [
                {
                    id: 'ricoh-im2500', name: 'IM C2500 / C2000', code: 'IMC2500',
                    toners: [
                        { id: 'ricoh-imc2500-blk', name: 'Black Toner', code: '842311', color: 'Black' },
                        { id: 'ricoh-imc2500-cyn', name: 'Cyan Toner', code: '842314', color: 'Cyan' },
                        { id: 'ricoh-imc2500-mag', name: 'Magenta Toner', code: '842313', color: 'Magenta' },
                        { id: 'ricoh-imc2500-yel', name: 'Yellow Toner', code: '842312', color: 'Yellow' },
                    ]
                },
                {
                    id: 'ricoh-mpc3003', name: 'MP C3003 / C3503', code: 'MPC3003',
                    toners: [
                        { id: 'ricoh-mpc3503-blk', name: 'Black Toner', code: '841813', color: 'Black' },
                        { id: 'ricoh-mpc3503-cyn', name: 'Cyan Toner', code: '841816', color: 'Cyan' },
                        { id: 'ricoh-mpc3503-mag', name: 'Magenta Toner', code: '841815', color: 'Magenta' },
                        { id: 'ricoh-mpc3503-yel', name: 'Yellow Toner', code: '841814', color: 'Yellow' },
                    ]
                }
            ]
        },
        {
            name: 'Kyocera',
            models: [
                {
                    id: 'kyo-fs-6025', name: 'FS-6025MFP / FS-6525MFP', code: 'FS-6025',
                    toners: [
                        { id: 'tk-475', name: 'TK-475 Black', code: 'TK-475', color: 'Black' }
                    ]
                },
                {
                    id: 'kyo-tas-2552', name: 'TASKalfa 2552ci / 3252ci', code: 'TA-2552ci',
                    toners: [
                        { id: 'tk-8335k', name: 'TK-8335 Black', code: 'TK-8335K', color: 'Black' },
                        { id: 'tk-8335c', name: 'TK-8335 Cyan', code: 'TK-8335C', color: 'Cyan' },
                        { id: 'tk-8335m', name: 'TK-8335 Magenta', code: 'TK-8335M', color: 'Magenta' },
                        { id: 'tk-8335y', name: 'TK-8335 Yellow', code: 'TK-8335Y', color: 'Yellow' },
                    ]
                },
                {
                    id: 'kyo-ecosys-m5521', name: 'ECOSYS M5521cdw', code: 'M5521',
                    toners: [
                        { id: 'tk-5230k', name: 'TK-5230 Black', code: 'TK-5230K', color: 'Black' },
                        { id: 'tk-5230c', name: 'TK-5230 Cyan', code: 'TK-5230C', color: 'Cyan' },
                        { id: 'tk-5230m', name: 'TK-5230 Magenta', code: 'TK-5230M', color: 'Magenta' },
                        { id: 'tk-5230y', name: 'TK-5230 Yellow', code: 'TK-5230Y', color: 'Yellow' },
                    ]
                }
            ]
        },
        {
            name: 'Toshiba',
            models: [
                {
                    id: 'tosh-estudio-2505', name: 'e-STUDIO 2505AC / 3005AC', code: 'e-S 2505AC',
                    toners: [
                        { id: 't-fc505k', name: 'T-FC505 Black', code: 'T-FC505K', color: 'Black' },
                        { id: 't-fc505c', name: 'T-FC505 Cyan', code: 'T-FC505C', color: 'Cyan' },
                        { id: 't-fc505m', name: 'T-FC505 Magenta', code: 'T-FC505M', color: 'Magenta' },
                        { id: 't-fc505y', name: 'T-FC505 Yellow', code: 'T-FC505Y', color: 'Yellow' },
                    ]
                },
                {
                    id: 'tosh-estudio-2309', name: 'e-STUDIO 2309A / 2809A', code: 'e-S 2309A',
                    toners: [
                        { id: 't-2309e', name: 'Black Toner', code: 'T-2309E', color: 'Black' }
                    ]
                }
            ]
        },
        {
            name: 'Sharp',
            models: [
                {
                    id: 'sharp-mx-2610', name: 'MX-2610N / MX-3110N', code: 'MX-2610N',
                    toners: [
                        { id: 'mx-36gtba', name: 'Black Toner', code: 'MX-36GTBA', color: 'Black' },
                        { id: 'mx-36gtca', name: 'Cyan Toner', code: 'MX-36GTCA', color: 'Cyan' },
                        { id: 'mx-36gtma', name: 'Magenta Toner', code: 'MX-36GTMA', color: 'Magenta' },
                        { id: 'mx-36gtya', name: 'Yellow Toner', code: 'MX-36GTYA', color: 'Yellow' },
                    ]
                },
                {
                    id: 'sharp-mx-m3070', name: 'MX-M3070 / MX-M3570', code: 'MX-M3070',
                    toners: [
                        { id: 'mx-560nt', name: 'Black Toner', code: 'MX-560NT', color: 'Black' }
                    ]
                }
            ]
        }
    ]
}

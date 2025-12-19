
import { PolygonPoint } from '../../types';

export const SURVEY_POLYGONS: PolygonPoint[] = [
    // --- Main Road Series (500s) ---
    { id: '500', polygonNo: '500', roadName: 'Main Road', km: '14+520', offset: '-473.67', east: '451060.922', north: '468395.575', elevation: '376.522', lat: '45.713582', lng: '24.369800', description: 'Poligon P-500', status: 'ACTIVE' },
    { id: '501', polygonNo: '501', roadName: 'Main Road', km: '14+371', offset: '-386.81', east: '450964.973', north: '468252.932', elevation: '375.564', lat: '45.712291', lng: '24.368582', description: 'Poligon P-501', status: 'ACTIVE' },
    { id: '502', polygonNo: '502', roadName: 'Main Road', km: '13+617', offset: '-50.83', east: '450430.827', north: '467622.649', elevation: '375.494', lat: '45.706581', lng: '24.361785', description: 'Poligon P-502', status: 'ACTIVE' },
    { id: '503', polygonNo: '503', roadName: 'Main Road', km: '13+529', offset: '71.05', east: '450404.443', north: '467474.656', elevation: '375.037', lat: '45.705248', lng: '24.361461', description: 'Poligon P-503', status: 'ACTIVE' },
    { id: '504', polygonNo: '504', roadName: 'Main Road', km: '12+576', offset: '-88.56', east: '449476.680', north: '467186.657', elevation: '370.997', lat: '45.702589', lng: '24.349576', description: 'Poligon P-504', status: 'ACTIVE' },
    { id: '507', polygonNo: '507', roadName: 'Main Road', km: '11+635', offset: '45.02', east: '448836.601', north: '466479.805', elevation: '368.991', lat: '45.696181', lng: '24.341430', description: 'Poligon P-507', status: 'ACTIVE' },
    { id: '509', polygonNo: '509', roadName: 'Main Road', km: '10+679', offset: '74.94', east: '448350.720', north: '465681.652', elevation: '370.293', lat: '45.688962', lng: '24.335276', description: 'Poligon P-509', status: 'ACTIVE' },
    { id: '510', polygonNo: '510', roadName: 'Main Road', km: '9+610', offset: '-119.62', east: '447876.290', north: '464708.788', elevation: '377.441', lat: '45.680171', lng: '24.329289', description: 'Poligon P-510', status: 'ACTIVE' },
    { id: '512', polygonNo: '512', roadName: 'Main Road', km: '8+318', offset: '285.57', east: '448036.487', north: '463363.915', elevation: '397.239', lat: '45.668081', lng: '24.331490', description: 'Poligon P-512', status: 'ACTIVE' },
    { id: '513', polygonNo: '513', roadName: 'Main Road', km: '8+353', offset: '131.92', east: '447891.952', north: '463426.734', elevation: '393.405', lat: '45.668635', lng: '24.329628', description: 'Poligon P-513', status: 'ACTIVE' },
    { id: '517', polygonNo: '517', roadName: 'Main Road', km: '6+172', offset: '-44.44', east: '446304.766', north: '462095.028', elevation: '365.215', lat: '45.656530', lng: '24.309404', description: 'Poligon P-517', status: 'ACTIVE' },
    { id: '518', polygonNo: '518', roadName: 'Main Road', km: '5+214', offset: '72.68', east: '445350.188', north: '462126.519', elevation: '365.731', lat: '45.656738', lng: '24.297151', description: 'Poligon P-518', status: 'ACTIVE' },
    { id: '520', polygonNo: '520', roadName: 'Main Road', km: '4+128', offset: '44.77', east: '444332.099', north: '462129.502', elevation: '378.720', lat: '45.656684', lng: '24.284086', description: 'Poligon P-520', status: 'ACTIVE' },
    { id: '521', polygonNo: '521', roadName: 'Main Road', km: '4+171', offset: '-83.23', east: '444314.233', north: '462263.403', elevation: '381.239', lat: '45.657887', lng: '24.283841', description: 'Poligon P-521', status: 'ACTIVE' },
    { id: '522', polygonNo: '522', roadName: 'Main Road', km: '3+199', offset: '-49.50', east: '443677.365', north: '461497.271', elevation: '410.055', lat: '45.650941', lng: '24.275757', description: 'Poligon P-522', status: 'ACTIVE' },
    { id: '523', polygonNo: '523', roadName: 'Main Road', km: '3+098', offset: '-87.12', east: '443599.270', north: '461422.306', elevation: '409.548', lat: '45.650260', lng: '24.274764', description: 'Poligon P-523', status: 'ACTIVE' },
    
    // --- Boita Ramps ---
    { id: '525', polygonNo: '525', roadName: 'Boita Ramp-10', km: '0+728', offset: '60.48', east: '443236.473', north: '460328.341', elevation: '381.290', lat: '45.640386', lng: '24.270237', description: 'Ramp Connection', status: 'ACTIVE' },
    { id: '526', polygonNo: '526', roadName: 'Boita Ramp-1', km: '0+739', offset: '90.05', east: '442283.978', north: '460338.103', elevation: '396.703', lat: '45.640395', lng: '24.258017', description: 'Ramp Connection', status: 'ACTIVE' },
    { id: '527', polygonNo: '527', roadName: 'Boita Ramp-1', km: '0+617', offset: '105.88', east: '442186.482', north: '460443.072', elevation: '396.713', lat: '45.641332', lng: '24.256754', description: 'Ramp Connection', status: 'ACTIVE' },
    { id: '528', polygonNo: '528', roadName: 'Boita Ramp-8', km: '0+679', offset: '82.07', east: '442801.162', north: '461670.382', elevation: '421.577', lat: '45.652427', lng: '24.264494', description: 'Ramp Connection', status: 'ACTIVE' },

    // --- 1000 Series (Main Road) ---
    { id: '1000', polygonNo: '1000', roadName: 'Main Road', km: '14+651', offset: '-72.29', east: '451353.410', north: '468090.951', elevation: '380.214', lat: '45.710861', lng: '24.373588', description: 'P-1000', status: 'ACTIVE' },
    { id: '1001', polygonNo: '1001', roadName: 'Main Road', km: '14+383', offset: '-51.85', east: '451121.052', north: '467956.315', elevation: '379.842', lat: '45.709633', lng: '24.370617', description: 'P-1001', status: 'ACTIVE' },
    { id: '1004', polygonNo: '1004', roadName: 'Main Road', km: '13+300', offset: '38.54', east: '450184.176', north: '467404.620', elevation: '375.296', lat: '45.704602', lng: '24.358640', description: 'P-1004', status: 'ACTIVE' },
    { id: '1010', polygonNo: '1010', roadName: 'Main Road', km: '11+078', offset: '-53.36', east: '448425.366', north: '466092.355', elevation: '369.121', lat: '45.692646', lng: '24.336190', description: 'P-1010', status: 'ACTIVE' },
    { id: '1032', polygonNo: '1032', roadName: 'Main Road', km: '5+006', offset: '60.70', east: '445152.384', north: '462187.783', elevation: '365.517', lat: '45.657274', lng: '24.294605', description: 'P-1032', status: 'ACTIVE' },
    { id: '1038', polygonNo: '1038', roadName: 'Main Road', km: '3+441', offset: '-48.65', east: '443790.109', north: '461714.527', elevation: '416.789', lat: '45.652906', lng: '24.277179', description: 'P-1038', status: 'ACTIVE' },

    // --- Misc & MCJ/MK Series ---
    { id: '1043', polygonNo: '1043', roadName: 'Boita Ramp-10', km: '0+582', offset: '33.46', east: '443101.880', north: '460239.463', elevation: '381.931', lat: '45.639575', lng: '24.268521', description: 'Ramp Point', status: 'ACTIVE' },
    { id: '1044', polygonNo: '1044', roadName: 'Boita Ramp-10', km: '0+337', offset: '39.99', east: '442860.112', north: '460141.984', elevation: '370.290', lat: '45.638678', lng: '24.265431', description: 'Ramp Point', status: 'ACTIVE' },
    { id: '1049', polygonNo: '1049', roadName: 'Boita Ramp-1', km: '0+088', offset: '113.78', east: '442130.033', north: '461038.255', elevation: '456.156', lat: '45.646683', lng: '24.255958', description: 'Ramp Point', status: 'ACTIVE' },
    { id: 'MCJ-2', polygonNo: 'MCJ-2', roadName: 'Boita Ramp-3', km: '0+245', offset: '1.85', east: '441993.856', north: '460403.839', elevation: '405.754', lat: '45.640962', lng: '24.254287', description: 'Junction Point', status: 'ACTIVE' },
    { id: 'MCJ-3', polygonNo: 'MCJ-3', roadName: 'Boita Ramp-3', km: '0+151', offset: '-59.17', east: '441879.190', north: '460402.332', elevation: '412.844', lat: '45.640939', lng: '24.252816', description: 'Junction Point', status: 'ACTIVE' },
    { id: 'MK-1', polygonNo: 'MK-1', roadName: 'Boita Ramp-4', km: '1+789', offset: '25.54', east: '442312.080', north: '461433.325', elevation: '434.928', lat: '45.650253', lng: '24.258247', description: 'MK Point', status: 'ACTIVE' },
    { id: 'MK-2', polygonNo: 'MK-2', roadName: 'Boita Ramp-4', km: '0+768', offset: '83.68', east: '442502.049', north: '460521.829', elevation: '382.184', lat: '45.642067', 'lng': '24.260793', description: 'MK Point', status: 'ACTIVE' },
    { id: 'MK-3', polygonNo: 'MK-3', roadName: 'Main Road', km: '0+740', offset: '78.61', east: '443039.030', north: '460875.588', elevation: '404.963', lat: '45.645295', 'lng': '24.267640', description: 'MK Point', status: 'ACTIVE' },
    
    // --- P Series (Boita Ramp-2 & 4 & Main) ---
    { id: 'P1', polygonNo: 'P1', roadName: 'Boita Ramp-2', km: '1+946', offset: '28.52', east: '441895.302', north: '460530.244', elevation: '410.568', lat: '45.642092', lng: '24.253008', description: 'P-1', status: 'ACTIVE' },
    { id: 'P2', polygonNo: 'P2', roadName: 'Boita Ramp-2', km: '1+775', offset: '48.24', east: '442015.699', north: '460665.309', elevation: '406.029', lat: '45.643317', lng: '24.254536', description: 'P-2', status: 'ACTIVE' },
    { id: 'P3', polygonNo: 'P3', roadName: 'Boita Ramp-4', km: '2+835', offset: '33.81', east: '441790.086', north: '462335.208', elevation: '441.003', lat: '45.658325', lng: '24.251441', description: 'P-3', status: 'ACTIVE' },
    { id: 'P4', polygonNo: 'P4', roadName: 'Boita Ramp-4', km: '2+643', offset: '39.50', east: '441879.616', north: '462169.836', elevation: '442.103', lat: '45.656845', lng: '24.252610', description: 'P-4', status: 'ACTIVE' },
    { id: 'P5', polygonNo: 'P5', roadName: 'Boita Ramp-4', km: '2+471', offset: '49.18', east: '441982.295', north: '462039.332', elevation: '434.082', lat: '45.655679', lng: '24.253943', description: 'P-5', status: 'ACTIVE' },
    { id: 'P6', polygonNo: 'P6', roadName: 'Boita Ramp-4', km: '2+425', offset: '57.58', east: '442017.969', north: '462008.355', elevation: '431.925', lat: '45.655403', lng: '24.254404', description: 'P-6', status: 'ACTIVE' },
    { id: 'P7', polygonNo: 'P7', roadName: 'Boita Ramp-4', km: '2+222', offset: '-83.99', east: '442019.158', north: '461761.816', elevation: '399.576', lat: '45.653185', lng: '24.254449', description: 'P-7', status: 'ACTIVE' },
    { id: 'P8', polygonNo: 'P8', roadName: 'Boita Ramp-4', km: '2+186', offset: '4.61', east: '442112.875', north: '461778.865', elevation: '404.322', lat: '45.653346', lng: '24.255650', description: 'P-8', status: 'ACTIVE' },
    { id: 'P9', polygonNo: 'P9', roadName: 'Boita Ramp-4', km: '2+012', offset: '-64.90', east: '442134.740', north: '461595.394', elevation: '415.776', lat: '45.651697', lng: '24.255952', description: 'P-9', status: 'ACTIVE' },
    { id: 'P10', polygonNo: 'P10', roadName: 'Boita Ramp-4', km: '1+976', offset: '23.98', east: '442230.412', north: '461601.817', elevation: '417.039', lat: '45.651763', lng: '24.257179', description: 'P-10', status: 'ACTIVE' },
    { id: 'P11', polygonNo: 'P11', roadName: 'Boita Ramp-4', km: '1+789', offset: '-23.83', east: '442267.470', north: '461412.163', elevation: '433.488', lat: '45.650059', lng: '24.257677', description: 'P-11', status: 'ACTIVE' },
    { id: 'P12', polygonNo: 'P12', roadName: 'Boita Ramp-4', km: '1+499', offset: '-103.79', east: '442359.808', north: '461106.861', elevation: '446.249', lat: '45.647319', lng: '24.258898', description: 'P-12', status: 'ACTIVE' },
    { id: 'P13', polygonNo: 'P13', roadName: 'Boita Ramp-2', km: '1+386', offset: '80.55', east: '442399.702', north: '460832.714', elevation: '401.586', lat: '45.644856', lng: '24.259443', description: 'P-13', status: 'ACTIVE' },
    
    // --- Sample from bottom of the list ---
    { id: 'P20', polygonNo: 'P20', roadName: 'Boita Ramp-1', km: '1+213', offset: '39.87', east: '442588.717', north: '460261.489', elevation: '375.507', lat: '45.639731', lng: '24.261935', description: 'P-20', status: 'ACTIVE' },
    { id: 'P21', polygonNo: 'P21', roadName: 'Boita Ramp-0', km: '0+967', offset: '33.65', east: '442752.208', north: '460361.608', elevation: '379.097', lat: '45.640646', lng: '24.264021', description: 'P-21', status: 'ACTIVE' },
    { id: 'P36', polygonNo: 'P36', roadName: 'Boita Ramp-3', km: '0+051', offset: '-19.98', east: '442939.334', north: '461036.065', elevation: '394.464', lat: '45.646730', lng: '24.266342', description: 'P-36', status: 'ACTIVE' },
    { id: 'P37', polygonNo: 'P37', roadName: 'Boita Ramp-3', km: '1+042', offset: '32.70', east: '442747.456', north: '460652.988', elevation: '385.071', lat: '45.643267', lng: '24.263925', description: 'P-37', status: 'ACTIVE' },
    
    // --- End of Main Road (Sampled) ---
    { id: 'P112', polygonNo: 'P112', roadName: 'Main Road', km: '12+593', offset: '-32.76', east: '449519.336', north: '467147.619', elevation: '370.452', lat: '45.702240', 'lng': '24.350134', description: 'P-112', status: 'ACTIVE' },
];

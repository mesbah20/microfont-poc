export interface VehicleInfoDetail {
  id?: number;
  taxTokenDate: string;
  taxTokenExpiryDate: string;
  fitnessDate: string;
  fitnessExpiryDate: string;
  insuranceIssueDate?: string;
  insuranceExpiryDate?: string;
}

export interface VehicleInfo {
  id?: string;
  uuid?: string;
  // Required fields
  vehicleType: string;
  availability: string; // Commented out as per vehicle-info.component.ts
  routeName?: string;
  routeId?: number;
  vehicleName: string;
  noOfSeats: number;
  overallCondition: string;
  registrationNumber: string;
  chassisNumber: string;
  engineNumber: string;
  vehicleReceiveDate: string;
  usageType: string;
  // assignedFor: string; // Commented out as per vehicle-info.component.ts
  purchaseType: string; // Added to match backend and component usage
  // Optional fields
  tyreSize?: string;
  tyreType?: string;
  vehicleModel?: string;
  purchasePrice?: number;
  purchaseDate?: string;
  maxPassengerCapacity?: number;
  vehicleColor?: string;
  engineCC?: number;
  mileage?: number;
  cngCapacity?: number;
  // fare?: number; // Commented out as per vehicle-info.component.ts
  fuelCapacity?: number;
  fiscalYear?: string;
  supplierName?: string;
  insuranceNo?: string;
  insuranceCompany?: string;
  details?: VehicleInfoDetail[]; // Added to store details array
}

// API Response wrapper
export interface VehicleApiResponse<T = VehicleInfo> {
  success: boolean;
  data: T;
  message: string;
  status?: boolean; // Added to match response structure in components
  payload?: T; // Added to match response structure in components
}

// Type alias for form data (same structure as VehicleInfo but without id)
export type VehicleFormData = Omit<VehicleInfo, 'id'>;

// Type alias for create request (includes details for creation)
export type CreateVehicleRequest = Omit<VehicleInfo, 'id'>;

// Type alias for update details request
export interface UpdateVehicleDetailsRequest {
  id: number;
  details: VehicleInfoDetail[];
}

export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
  };
  totalPages: number;
  last: boolean;
  totalElements: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
}

export interface ApiResponse<T> {
  payload: T;
  timestamp: string;
  message: string;
  status: boolean;
}


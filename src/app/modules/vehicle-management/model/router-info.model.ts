// Stoppage Information Interface
export interface StoppageInfo {
  stoppage: string;
  distance: number;
  arrivalTime: string | null;
  departureTime: string | null;
}

// Main Route Data Interface
export interface RouteInfo {
  id?: string;
  routeName: string;
  totalDistance: number;
  startPoint: string;
  endPoint: string;
  startTime: string;
  endTime: string ;
  stoppages: StoppageInfo[];
}

// API Response wrapper
export interface RouteInfoApiResponse<T = RouteInfo> {
  success: boolean;
  data: T;
  message: string;
}

// Type alias for form data (same structure as RouteInfo but without id)
export type RouteInfoFormData = Omit<RouteInfo, 'id'>;

// Type alias for create request (same as RouteInfo without id)
export type CreateRouteInfoRequest = Omit<RouteInfo, 'id'>;
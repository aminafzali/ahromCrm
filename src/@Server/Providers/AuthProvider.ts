import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { ForbiddenException, UnauthorizedException } from '../Exceptions/BaseException';

export class AuthProvider {
  /**
   * Check if the user is authenticated
   */
  static async isAuthenticated(req: NextRequest , mustLoggedIn: boolean = true): Promise<any> {
    const token = await getToken({ req });
    
    if (!token && mustLoggedIn) {
      throw new UnauthorizedException('You must be logged in to access this resource');
    }
    
    return token;
  }

  /**
   * Check if the user is an admin
   */
  static async isAdmin(req: NextRequest): Promise<any> {
    const token = await AuthProvider.isAuthenticated(req);
    
    if (token.role !== "ADMIN") {
      throw new ForbiddenException('You do not have permission to access this resource');
    }
    
    return token;
  }

  /**
   * Check if the user has a specific role
   */
  static async hasRole(req: NextRequest, roles: string[]): Promise<any> {
    const token = await AuthProvider.isAuthenticated(req);
    
    if (!roles.includes(token.role)) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }
    
    return token;
  }

  /**
   * Check if the user owns a resource
   */
  static async ownsResource(req: NextRequest, userId:  string): Promise<any> {
    const token = await AuthProvider.isAuthenticated(req);
    
    // Convert to string for comparison
    const tokenUserId = token.id.toString();
    const resourceUserId = userId.toString();
    
    if (token.role !== 'ADMIN' && tokenUserId !== resourceUserId) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }
    
    return token;
  }
}
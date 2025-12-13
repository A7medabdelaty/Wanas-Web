import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UserService } from '../services/user.service';

@Injectable({
    providedIn: 'root'
})
export class AccountStatusGuard implements CanActivate {
    constructor(
        private userService: UserService,
        private router: Router
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> {
        return this.userService.getUserStatus().pipe(
            map(status => {
                // If banned, redirect to banned page
                if (status.isBanned) {
                    this.router.navigate(['/account/banned'], {
                        state: {
                            reason: status.banReason,
                            bannedAt: status.bannedAt
                        }
                    });
                    return false;
                }

                // If suspended, check if suspension is still active
                if (status.isSuspended) {
                    const now = new Date();
                    const suspendedUntil = status.suspendedUntil
                        ? new Date(status.suspendedUntil)
                        : null;

                    // If suspension is still active
                    if (suspendedUntil && now < suspendedUntil) {
                        this.router.navigate(['/account/suspended'], {
                            state: {
                                reason: status.suspensionReason,
                                suspendedUntil: status.suspendedUntil,
                                suspendedAt: status.suspendedAt
                            }
                        });
                        return false;
                    }
                }

                // Account is active
                return true;
            }),
            catchError(error => {
                console.error('Error checking account status:', error);
                // Fail open: allow access if check fails
                return of(true);
            })
        );
    }
}
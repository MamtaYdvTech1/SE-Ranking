import { NextRequest, NextResponse } from 'next/server';
import { verifyDomainExists } from '@/lib/server/domain-validator';
import { validateRealDomainFormat } from '@/lib/validation/schemas';
import { prisma } from '@/lib/db/prisma';
import { getAuthSession } from '@/lib/server/auth';

export async function GET(req: NextRequest) {
  let domain = '';
  try {
    domain = req.nextUrl.searchParams.get('domain') || '';

    if (!domain.trim()) {
      return NextResponse.json(
        { valid: false, error: 'Domain is required.' },
        { status: 400 }
      );
    }

    // Step 1: Format check (instantaneous, never throws)
    const formatCheck = validateRealDomainFormat(domain);
    if (!formatCheck.valid) {
      return NextResponse.json(
        { valid: false, error: formatCheck.error || 'Please enter a real domain name (e.g. example.com).' },
        { status: 400 }
      );
    }

    const normalizedDomain = formatCheck.normalizedDomain;

    // Step 2: Safe DNS verification
    let dnsResult: { valid: boolean; normalizedDomain: string; error?: string } = { valid: true, normalizedDomain };
    try {
      dnsResult = await verifyDomainExists(normalizedDomain);
    } catch (dnsErr) {
      console.warn('DNS lookup non-fatal error:', dnsErr);
    }

    if (!dnsResult.valid && dnsResult.error) {
      return NextResponse.json(dnsResult, { status: 400 });
    }

    // Step 3: Check if duplicate project already exists for the CURRENT user
    try {
      const auth = await getAuthSession(req);
      const userId = auth?.user?.id;
      if (userId) {
        const existing = await (prisma as any).project.findFirst({
          where: {
            userId,
            domain: normalizedDomain,
            deletedAt: null,
          },
          select: { id: true, domain: true },
        });

        if (existing) {
          return NextResponse.json(
            {
              valid: false,
              isDuplicate: true,
              error: `You already have an active project for domain "${existing.domain}".`,
            },
            { status: 400 }
          );
        }
      }
    } catch (dbErr) {
      console.warn('Project duplicate check non-fatal error:', dbErr);
    }

    return NextResponse.json({
      valid: true,
      normalizedDomain,
    });
  } catch (err: any) {
    console.error('Error validating domain:', err);
    // If the domain string is a valid domain format (like amazon.in), NEVER fail with 500 error!
    if (domain) {
      const fallback = validateRealDomainFormat(domain);
      if (fallback.valid) {
        return NextResponse.json({
          valid: true,
          normalizedDomain: fallback.normalizedDomain,
        });
      }
    }
    return NextResponse.json(
      { valid: false, error: 'Please enter a valid website domain (e.g. example.com).' },
      { status: 400 }
    );
  }
}

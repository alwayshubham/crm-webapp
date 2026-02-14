export function calculateLeadScore(lead: {
    email?: string | null;
    phone?: string | null;
    company?: string | null;
    source?: string | null;
    status?: string;
}) {
    let score = 0;
    const reasons: string[] = [];

    if (lead.email) {
        score += 20;
        reasons.push('Has email (+20)');
    }
    if (lead.phone) {
        score += 20;
        reasons.push('Has phone (+20)');
    }
    if (lead.company) {
        score += 20;
        reasons.push('Has company (+20)');
    }

    if (lead.source === 'Website' || lead.source === 'Referral') {
        score += 20;
        reasons.push('High quality source (+20)');
    } else if (lead.source) {
        score += 10;
        reasons.push('Known source (+10)');
    }

    if (lead.status === 'Qualified' || lead.status === 'Proposal') {
        score += 20;
        reasons.push('Advanced stage (+20)');
    }

    return { score, reason: reasons.join(', ') };
}

import { afterEach, describe, expect, it, vi } from 'vitest'

/** Same per-test client mock + fresh import pattern as the other productionApi tests. */
describe('communications productionApi', () => {
  afterEach(() => {
    vi.doUnmock('@/lib/supabaseClient')
    vi.resetModules()
  })

  const ROW = {
    id: 'comm-1',
    title: 'Restructuring announcement',
    audience: 'All staff',
    channel: 'email',
    status: 'scheduled',
    scheduled_for: '2026-09-01',
    sent_on: null,
    template_tid: 'T36',
    note: null,
  }

  it('listCommunications returns parsed rows scoped to the org, newest first', async () => {
    const order = vi.fn().mockResolvedValue({ data: [ROW], error: null })
    const eq = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ eq })
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: { from: vi.fn().mockReturnValue({ select }) },
    }))
    vi.resetModules()
    const api = await import('./productionApi')

    const rows = await api.listCommunications('org-1')
    expect(eq).toHaveBeenCalledWith('organization_id', 'org-1')
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(rows).toEqual([
      {
        id: 'comm-1',
        title: 'Restructuring announcement',
        audience: 'All staff',
        channel: 'email',
        status: 'scheduled',
        scheduledFor: '2026-09-01',
        sentOn: null,
        templateTid: 'T36',
        note: null,
      },
    ])
  })

  it('addCommunication inserts with the org id and nulls blank optionals', async () => {
    const single = vi.fn().mockResolvedValue({
      data: { ...ROW, audience: null, template_tid: null, scheduled_for: null },
      error: null,
    })
    const select = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select })
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: { from: vi.fn().mockReturnValue({ insert }) },
    }))
    vi.resetModules()
    const api = await import('./productionApi')

    await api.addCommunication('org-1', {
      title: 'Restructuring announcement',
      audience: '  ',
      channel: 'email',
      status: 'draft',
      scheduledFor: '',
      templateTid: '',
      note: '',
    })
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        organization_id: 'org-1',
        title: 'Restructuring announcement',
        audience: null,
        status: 'draft',
        scheduled_for: null,
        template_tid: null,
        note: null,
      }),
    )
  })

  /* Naming matters here: the demo's button said "Send", and nothing in the
     product sends. This one records that the employer did. */
  it('markCommunicationSent stamps the caller’s date and does not send anything', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: { from: vi.fn().mockReturnValue({ update }) },
    }))
    vi.resetModules()
    const api = await import('./productionApi')

    await api.markCommunicationSent('comm-1', '2026-08-02')
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'sent', sent_on: '2026-08-02' }),
    )
    expect(eq).toHaveBeenCalledWith('id', 'comm-1')
  })

  it('rejects a row whose status is outside the schema', async () => {
    const order = vi
      .fn()
      .mockResolvedValue({ data: [{ ...ROW, status: 'delivered' }], error: null })
    const select = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ order }) })
    vi.doMock('@/lib/supabaseClient', () => ({
      supabase: { from: vi.fn().mockReturnValue({ select }) },
    }))
    vi.resetModules()
    const api = await import('./productionApi')

    await expect(api.listCommunications('org-1')).rejects.toThrow()
  })

  it('throws when the client is not configured', async () => {
    vi.doMock('@/lib/supabaseClient', () => ({ supabase: null }))
    vi.resetModules()
    const api = await import('./productionApi')
    await expect(api.listCommunications('org-1')).rejects.toThrow('Supabase is not configured')
  })
})

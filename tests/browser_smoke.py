"""Optional Playwright smoke test; uses a generated standalone copy, not a live host.
Run: python tests/browser_smoke.py [--chromium /path/to/chromium]
Requires Python's playwright package and Chromium. Nothing is added to npm.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path
import subprocess
import tempfile
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--chromium', default=None)
parser.add_argument('--screenshots', action='store_true')
args = parser.parse_args()
passed = []
errors = []

def done(message: str) -> None:
    passed.append(message)
    print('PASS:', message, flush=True)

with tempfile.TemporaryDirectory(prefix='road-ready-browser-') as td:
    offline = Path(td) / 'road-ready.html'
    subprocess.run(['node', str(ROOT/'scripts/preview.cjs'), str(offline)], check=True)
    html = offline.read_text()
    with sync_playwright() as pw:
        opts = {'headless': True}
        if args.chromium:
            opts['executable_path'] = args.chromium
        browser = pw.chromium.launch(**opts)
        contexts = []
        requests = []

        def fresh(width=1440, height=1050):
            context = browser.new_context(viewport={'width':width,'height':height}, reduced_motion='reduce', accept_downloads=True)
            contexts.append(context)
            page = context.new_page()
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
            page.on('request', lambda r: requests.append(r.url))
            # set_content avoids environment policies blocking file/localhost navigation.
            page.set_content(html, wait_until='load')
            assert not page.locator('#fatal').is_visible()
            return page

        def request(page, text):
            page.locator('#request-input').fill(text)
            page.locator('#request-form button').click()

        def answer(page, correct=True):
            # Find the authored stable id, never assume the displayed A/B position.
            stem=page.locator('#question-stem').inner_text()
            key=page.evaluate('(stem)=>window.ROAD_READY_BANK.questions.find(q=>q.stem===stem).correctId',stem)
            choice=key if correct else next(x for x in ['a','b','c','d'] if x!=key)
            page.locator(f'input[name=answer][value="{choice}"]').check()
            page.locator('#check-button').click()

        page=fresh()
        assert page.locator('#stat-answered').inner_text()=='0'
        assert '226' in page.locator('#bank-count').inner_text()
        if args.screenshots:
            page.screenshot(path=str(ROOT/'docs/preview.png'),full_page=True)
        done('fresh launch and inventory; no previous chat scores')

        page.locator('#quick-start').click()
        for i in range(5):
            if i==1:
                page.locator('#hint-button').click()
                assert page.locator('#hint-text').is_visible()
            answer(page, correct=i!=0)
            assert page.locator('.choice-feedback').count()==4
            assert page.locator('#source-line a').get_attribute('href').startswith('https://www.ncdot.gov/')
            if i==0:
                assert page.locator('.choice.incorrect').evaluate('(e)=>getComputedStyle(e).backgroundColor') != page.locator('.choice.correct').evaluate('(e)=>getComputedStyle(e).backgroundColor')
            if i==0 and args.screenshots:
                page.screenshot(path=str(ROOT/'docs/feedback-preview.png'),full_page=True)
            page.locator('#next-button').click()
        assert page.locator('#round-summary').is_visible()
        assert '4 of 5' in page.locator('#round-summary-title').inner_text()
        assert page.locator('#batch-review .review-entry').count()==5
        assert page.locator('#stat-answered').inner_text()=='5'
        done('learning round, incorrect and assisted answers, all-option feedback, totals')

        page.locator('.nav-button[data-pane="session"]').click()
        assert page.locator('#session-history .review-entry').count()==5
        page.locator('#only-missed').check()
        assert page.locator('#session-history .review-entry').count()==1
        with page.expect_download() as download:
            page.locator('#download-report').click()
        report=json.loads(Path(download.value.path()).read_text())
        assert report['summary']['answered']==5 and report['summary']['correct']==4
        done('history filtering and explicit session-report download')

        page.locator('.nav-button[data-pane="practice"]').click()
        request(page,'5 questions on my weak spots')
        assert 'missed rule' in page.locator('#selection-note').inner_text()
        done('missed-rule follow-up request')

        page2=fresh()
        request(page2,'5 questions about headlights')
        assert 'headlights' in page2.locator('#request-status').inner_text().lower()
        assert 'Only 2' in page2.locator('#request-status').inner_text()
        answer(page2);page2.locator('#next-button').click();answer(page2);page2.locator('#next-button').click()
        request(page2,'5 questions about headlights')
        assert 'No matching unasked' in page2.locator('#request-status').inner_text()
        request(page2,'review headlights')
        assert 'Previously seen' in page2.locator('#selection-note').inner_text()
        request(page2,'5 questions about cooking')
        assert 'could not match' in page2.locator('#request-status').inner_text()
        done('specific metadata request, finite exhaustion, explicit review, unknown subject')

        page3=fresh()
        page3.locator('#mock-start').click()
        for i in range(25):
            assert not page3.locator('#hint-button').is_visible()
            answer(page3,correct=True)
            assert page3.locator('.choice-feedback').count()==0
            if i<24:assert page3.locator('#stat-answered').inner_text()=='0'
            page3.locator('#next-button').click()
        assert '25 of 25' in page3.locator('#round-summary-title').inner_text()
        assert page3.locator('#batch-review .review-entry').count()==25
        assert page3.locator('#batch-review .review-choice').count()==100
        done('25-question check defers feedback/scoring and reveals every explanation at the end')

        page4=fresh()
        page4.locator('.nav-button[data-pane="lab"]').click()
        page4.locator('#lab-request').fill('20 new bus-roadway scenarios')
        with page4.expect_download() as download:
            page4.locator('#download-prompt').click()
        prompt=Path(download.value.path()).read_text()
        assert '20 new bus-roadway scenarios' in prompt and 'Existing questions' in prompt
        done('question-lab generation prompt export')

        pack=json.loads((ROOT/'docs/example-pack.json').read_text())
        page4.locator('#pack-json').fill(json.dumps(pack))
        page4.locator('#validate-pack').click()
        assert 'Format valid' in page4.locator('#pack-preview').inner_text()
        assert page4.locator('#import-pack').is_disabled()
        page4.locator('#pack-ack').check();page4.locator('#import-pack').click()
        assert '227' in page4.locator('#bank-count').inner_text()
        page4.locator('#validate-pack').click()
        assert 'Duplicate question id' in page4.locator('#pack-preview').inner_text()
        done('validated session pack import, acknowledgment gate, duplicate rejection')

        bad=json.loads(json.dumps(pack));bad['questions'][0]['asset']='https://example.com/track.svg'
        page4.locator('#pack-json').fill(json.dumps(bad));page4.locator('#validate-pack').click()
        assert 'illustration' in page4.locator('#pack-preview').inner_text()
        malicious=json.loads(json.dumps(pack));malicious['packId']='safe-text-test';malicious['questions'][0]['id']='safe-text-q';malicious['questions'][0]['stem']='<img src=x onerror="window.__bad=true"> plain text fixture'
        page4.locator('#pack-json').fill(json.dumps(malicious));page4.locator('#validate-pack').click()
        assert '<img' in page4.locator('#pack-preview').inner_text()
        assert page4.locator('#pack-preview img').count()==0
        assert page4.evaluate('window.__bad===undefined')
        done('external asset rejection and HTML-shaped text rendered without execution')

        page4.locator('.nav-button[data-pane="session"]').click()
        page4.once('dialog',lambda d:d.accept())
        page4.locator('#reset-session').click()
        assert '226' in page4.locator('#bank-count').inner_text()
        assert page4.locator('#stat-answered').inner_text()=='0'
        assert page4.locator('#welcome-card').is_visible()
        done('full reset removes imported packs and history')

        keyboard=fresh()
        request(keyboard,'5 questions on signs')
        keyboard.locator('#question-stem').focus()
        keyboard.keyboard.press('1');keyboard.keyboard.press('Enter')
        assert keyboard.locator('.choice-feedback').count()==4
        keyboard.locator('#report-question').click()
        assert keyboard.locator('#issue-panel').is_visible()
        assert 'Question id:' in keyboard.locator('#issue-text').input_value()
        done('keyboard answer flow and local question-report creation')

        for width in [320,390,768,1440]:
            mobile=fresh(width,844)
            assert not mobile.evaluate('document.documentElement.scrollWidth>innerWidth')
            request(mobile,'5 questions on signs')
            assert mobile.locator('#question-image').is_visible()
            assert mobile.locator('#question-image').evaluate('(img)=>img.complete && img.naturalWidth>0')
            assert not mobile.evaluate('document.documentElement.scrollWidth>innerWidth')
            answer(mobile)
            assert not mobile.evaluate('document.documentElement.scrollWidth>innerWidth')
            if width==390 and args.screenshots:
                mobile.screenshot(path=str(ROOT/'docs/mobile-preview.png'),full_page=True)
        done('320/390/768/1440-pixel layouts, images, and feedback without horizontal overflow')

        assert not errors, errors
        assert not [r for r in requests if r.startswith(('http:','https:'))], requests
        assert all(not c.cookies() for c in contexts)
        done('no page/console errors, outgoing HTTP requests, or cookies during these workflows')
        browser.close()
print(f'{len(passed)} browser workflows passed.')

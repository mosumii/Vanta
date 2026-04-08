"""
Vanta Socials — Canary Tests
Playwright-based browser tests for site functionality.

Run:  pytest tests/ -v
With coverage: pytest tests/ -v --cov=tests --cov-report=html
"""

import re
import pytest
from playwright.sync_api import Page, expect


# ═══════════════════════════════════════════════
# INDEX.HTML — Page Load & Structure
# ═══════════════════════════════════════════════


class TestPageLoad:
    """Verify the main page loads without errors."""

    def test_page_loads_successfully(self, page: Page, base_url: str):
        page.goto(base_url)
        expect(page).to_have_title(re.compile(r"Vanta Socials"))

    def test_no_console_errors(self, page: Page, base_url: str):
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))
        page.goto(base_url)
        page.wait_for_timeout(2000)  # Wait for animations/scripts
        assert len(errors) == 0, f"Console errors found: {errors}"

    def test_loader_disappears(self, page: Page, base_url: str):
        page.goto(base_url)
        loader = page.locator(".loader")
        # Loader should eventually get the 'done' class
        expect(loader).to_have_class(re.compile(r"done"), timeout=5000)


# ═══════════════════════════════════════════════
# NAVIGATION
# ═══════════════════════════════════════════════


class TestNavigation:
    """Verify nav links and smooth scrolling."""

    def test_nav_exists(self, page: Page, base_url: str):
        page.goto(base_url)
        expect(page.locator("nav")).to_be_visible()

    def test_nav_logo_visible(self, page: Page, base_url: str):
        page.goto(base_url)
        expect(page.locator(".nav-logo")).to_be_visible()
        expect(page.locator(".nav-logo")).to_contain_text("Vanta")

    def test_nav_links_present(self, page: Page, base_url: str):
        page.goto(base_url)
        links = page.locator(".nav-links a")
        assert links.count() >= 5, "Expected at least 5 nav links"

    def test_nav_cta_present(self, page: Page, base_url: str):
        page.goto(base_url)
        cta = page.locator(".nav-cta")
        expect(cta).to_be_visible()
        expect(cta).to_contain_text("Book a Strategy Call")

    @pytest.mark.parametrize(
        "href,section_id",
        [
            ("#services", "services"),
            ("#pricing", "pricing"),
            ("#process", "process"),
            ("#gallery", "gallery"),
        ],
    )
    def test_nav_links_scroll_to_sections(
        self, page: Page, base_url: str, href: str, section_id: str
    ):
        page.goto(base_url)
        page.wait_for_timeout(2000)  # Wait for loader
        page.click(f'.nav-links a[href="{href}"]')
        page.wait_for_timeout(800)  # Wait for smooth scroll
        section = page.locator(f"#{section_id}")
        expect(section).to_be_visible()


# ═══════════════════════════════════════════════
# HERO SECTION
# ═══════════════════════════════════════════════


class TestHero:
    """Verify hero section content and CTAs."""

    def test_hero_heading(self, page: Page, base_url: str):
        page.goto(base_url)
        h1 = page.locator(".hero h1")
        expect(h1).to_be_visible()
        expect(h1).to_contain_text("ad infrastructure")

    def test_hero_cta_buttons(self, page: Page, base_url: str):
        page.goto(base_url)
        primary = page.locator(".hero-actions .btn-primary")
        ghost = page.locator(".hero-actions .btn-ghost")
        expect(primary).to_be_visible()
        expect(ghost).to_be_visible()

    def test_globe_canvas_exists(self, page: Page, base_url: str):
        page.goto(base_url)
        expect(page.locator("#globeCanvas")).to_be_visible()


# ═══════════════════════════════════════════════
# PROOF BAR & METRICS
# ═══════════════════════════════════════════════


class TestMetrics:
    """Verify proof bar and live metrics."""

    def test_proof_bar_items(self, page: Page, base_url: str):
        page.goto(base_url)
        items = page.locator(".proof-item")
        assert items.count() == 5, "Expected 5 proof bar items"

    def test_line_chart_canvas(self, page: Page, base_url: str):
        page.goto(base_url)
        expect(page.locator("#lineCanvas")).to_be_visible()

    def test_ticker_items(self, page: Page, base_url: str):
        page.goto(base_url)
        items = page.locator(".ticker-item")
        assert items.count() >= 6, "Expected at least 6 ticker items"


# ═══════════════════════════════════════════════
# SECTIONS EXISTENCE
# ═══════════════════════════════════════════════


class TestSections:
    """Verify all major sections exist."""

    @pytest.mark.parametrize(
        "section_id",
        ["problem", "why-ugc", "services", "gallery", "pricing", "process", "partnership", "book"],
    )
    def test_section_exists(self, page: Page, base_url: str, section_id: str):
        page.goto(base_url)
        section = page.locator(f"#{section_id}")
        assert section.count() > 0, f"Section #{section_id} not found"


# ═══════════════════════════════════════════════
# SERVICES
# ═══════════════════════════════════════════════


class TestServices:
    """Verify service cards."""

    def test_six_service_cards(self, page: Page, base_url: str):
        page.goto(base_url)
        cards = page.locator(".service-card")
        assert cards.count() == 6, f"Expected 6 service cards, got {cards.count()}"

    def test_service_cards_have_titles(self, page: Page, base_url: str):
        page.goto(base_url)
        titles = page.locator(".service-card h3")
        assert titles.count() == 6


# ═══════════════════════════════════════════════
# GALLERY
# ═══════════════════════════════════════════════


class TestGallery:
    """Verify gallery section and demo modal."""

    def test_gallery_cards_exist(self, page: Page, base_url: str):
        page.goto(base_url)
        cards = page.locator(".gallery-card")
        assert cards.count() >= 3, "Expected at least 3 gallery cards"

    def test_gallery_nav_buttons(self, page: Page, base_url: str):
        page.goto(base_url)
        expect(page.locator(".gallery-prev")).to_be_visible()
        expect(page.locator(".gallery-next")).to_be_visible()

    def test_demo_modal_exists(self, page: Page, base_url: str):
        page.goto(base_url)
        modal = page.locator(".demo-modal-overlay")
        assert modal.count() == 1


# ═══════════════════════════════════════════════
# PRICING
# ═══════════════════════════════════════════════


class TestPricing:
    """Verify pricing cards and CTAs."""

    def test_three_pricing_tiers(self, page: Page, base_url: str):
        page.goto(base_url)
        cards = page.locator(".pricing-card")
        assert cards.count() == 3, f"Expected 3 pricing cards, got {cards.count()}"

    def test_featured_tier_has_popular_badge(self, page: Page, base_url: str):
        page.goto(base_url)
        badge = page.locator(".pricing-popular")
        expect(badge).to_contain_text("Most Popular")

    def test_pricing_ctas_have_stripe_data(self, page: Page, base_url: str):
        page.goto(base_url)
        ctas = page.locator("[data-stripe]")
        assert ctas.count() == 3, "Expected 3 Stripe-linked CTAs"


# ═══════════════════════════════════════════════
# PROCESS
# ═══════════════════════════════════════════════


class TestProcess:
    """Verify process steps."""

    def test_four_process_steps(self, page: Page, base_url: str):
        page.goto(base_url)
        steps = page.locator(".process-step")
        assert steps.count() == 4, f"Expected 4 steps, got {steps.count()}"


# ═══════════════════════════════════════════════
# CONSULTATION MODAL
# ═══════════════════════════════════════════════


class TestConsultModal:
    """Verify consultation modal opens/closes."""

    def test_modal_opens_on_cta_click(self, page: Page, base_url: str):
        page.goto(base_url)
        page.wait_for_timeout(2000)  # Wait for loader
        page.click('[data-action="open-consult"]', timeout=5000)
        modal = page.locator("#consultModal")
        expect(modal).to_have_class(re.compile(r"active"), timeout=2000)

    def test_modal_closes_on_x_click(self, page: Page, base_url: str):
        page.goto(base_url)
        page.wait_for_timeout(2000)
        page.click('[data-action="open-consult"]', timeout=5000)
        page.wait_for_timeout(500)
        page.click("#consultModal .modal-close")
        page.wait_for_timeout(500)
        modal = page.locator("#consultModal")
        expect(modal).not_to_have_class(re.compile(r"active"))

    def test_modal_has_form_fields(self, page: Page, base_url: str):
        page.goto(base_url)
        page.wait_for_timeout(2000)
        page.click('[data-action="open-consult"]', timeout=5000)
        page.wait_for_timeout(500)
        expect(page.locator("#c-name")).to_be_visible()
        expect(page.locator("#c-email")).to_be_visible()
        expect(page.locator("#c-business")).to_be_visible()

    def test_modal_has_calendly_link(self, page: Page, base_url: str):
        page.goto(base_url)
        page.wait_for_timeout(2000)
        page.click('[data-action="open-consult"]', timeout=5000)
        page.wait_for_timeout(500)
        link = page.locator(".calendly-link")
        expect(link).to_be_visible()


# ═══════════════════════════════════════════════
# FOOTER
# ═══════════════════════════════════════════════


class TestFooter:
    """Verify footer content."""

    def test_footer_exists(self, page: Page, base_url: str):
        page.goto(base_url)
        expect(page.locator("footer")).to_be_visible()

    def test_footer_has_columns(self, page: Page, base_url: str):
        page.goto(base_url)
        cols = page.locator(".footer-col")
        assert cols.count() == 4, "Expected 4 footer columns"

    def test_footer_copyright(self, page: Page, base_url: str):
        page.goto(base_url)
        credit = page.locator(".footer-credit")
        expect(credit).to_contain_text("2026")


# ═══════════════════════════════════════════════
# QUESTIONNAIRE PAGE
# ═══════════════════════════════════════════════


class TestQuestionnaire:
    """Verify questionnaire multi-step form."""

    def test_questionnaire_loads(self, page: Page, questionnaire_url: str):
        page.goto(questionnaire_url)
        expect(page).to_have_title(re.compile(r"Questionnaire"))

    def test_step_1_visible_by_default(self, page: Page, questionnaire_url: str):
        page.goto(questionnaire_url)
        step1 = page.locator('[data-step="1"]')
        expect(step1).to_be_visible()

    def test_progress_bar_exists(self, page: Page, questionnaire_url: str):
        page.goto(questionnaire_url)
        steps = page.locator(".q-progress-step")
        assert steps.count() == 5, "Expected 5 progress steps"

    def test_step_navigation_forward(self, page: Page, questionnaire_url: str):
        page.goto(questionnaire_url)
        # Fill required fields in step 1
        page.fill("#q-biz-name", "Test Business")
        page.select_option("#q-industry", "food-bev")
        page.click(".q-btn-next")
        page.wait_for_timeout(600)
        step2 = page.locator('[data-step="2"]')
        expect(step2).to_be_visible()

    def test_step_navigation_backward(self, page: Page, questionnaire_url: str):
        page.goto(questionnaire_url)
        page.fill("#q-biz-name", "Test Business")
        page.select_option("#q-industry", "food-bev")
        page.click(".q-btn-next")
        page.wait_for_timeout(600)
        page.click(".q-btn-back")
        page.wait_for_timeout(600)
        step1 = page.locator('[data-step="1"]')
        expect(step1).to_be_visible()

    def test_validation_prevents_empty_business_name(self, page: Page, questionnaire_url: str):
        page.goto(questionnaire_url)
        # Don't fill business name, click next
        page.select_option("#q-industry", "food-bev")
        page.click(".q-btn-next")
        page.wait_for_timeout(300)
        # Should still be on step 1
        step1 = page.locator('[data-step="1"]')
        expect(step1).to_be_visible()

    def test_back_to_site_link(self, page: Page, questionnaire_url: str):
        page.goto(questionnaire_url)
        link = page.locator(".q-nav-back")
        expect(link).to_be_visible()
        expect(link).to_have_attribute("href", "index.html")


# ═══════════════════════════════════════════════
# BOBA SHOP DEMO
# ═══════════════════════════════════════════════


class TestBobaDemo:
    """Verify the embedded boba shop demo page."""

    def test_boba_page_loads(self, page: Page, boba_demo_url: str):
        page.goto(boba_demo_url)
        expect(page).to_have_title(re.compile(r"Koi Boba"))

    def test_boba_nav_exists(self, page: Page, boba_demo_url: str):
        page.goto(boba_demo_url)
        expect(page.locator(".koi-nav")).to_be_visible()

    def test_boba_menu_cards(self, page: Page, boba_demo_url: str):
        page.goto(boba_demo_url)
        cards = page.locator(".koi-menu-card")
        assert cards.count() >= 4, "Expected at least 4 menu items"

    def test_boba_add_to_cart_toast(self, page: Page, boba_demo_url: str):
        page.goto(boba_demo_url)
        page.click(".koi-add-btn >> nth=0")
        toast = page.locator("#koiToast")
        expect(toast).to_have_class(re.compile(r"show"), timeout=2000)

    def test_boba_footer_credits_vanta(self, page: Page, boba_demo_url: str):
        page.goto(boba_demo_url)
        footer = page.locator(".koi-footer-bottom")
        expect(footer).to_contain_text("Vanta Socials")


# ═══════════════════════════════════════════════
# RESPONSIVE LAYOUT
# ═══════════════════════════════════════════════


class TestResponsive:
    """Verify responsive behavior at different breakpoints."""

    def test_mobile_hamburger_visible(self, page: Page, base_url: str):
        page.set_viewport_size({"width": 375, "height": 812})
        page.goto(base_url)
        hamburger = page.locator(".nav-hamburger")
        expect(hamburger).to_be_visible()

    def test_mobile_nav_links_hidden(self, page: Page, base_url: str):
        page.set_viewport_size({"width": 375, "height": 812})
        page.goto(base_url)
        links = page.locator(".nav-links")
        expect(links).to_be_hidden()

    def test_desktop_nav_links_visible(self, page: Page, base_url: str):
        page.set_viewport_size({"width": 1280, "height": 800})
        page.goto(base_url)
        links = page.locator(".nav-links")
        expect(links).to_be_visible()


# ═══════════════════════════════════════════════
# ANIMATIONS
# ═══════════════════════════════════════════════


class TestAnimations:
    """Verify animation classes are applied."""

    def test_reveal_elements_exist(self, page: Page, base_url: str):
        page.goto(base_url)
        reveals = page.locator(".reveal, .reveal-left, .reveal-scale, .reveal-stagger")
        assert reveals.count() >= 5, "Expected at least 5 reveal-animated elements"

    def test_cursor_elements_exist(self, page: Page, base_url: str):
        page.goto(base_url)
        assert page.locator(".cursor-dot").count() == 1
        assert page.locator(".cursor-ring").count() == 1


# ═══════════════════════════════════════════════
# UGC CREATOR APPLICATION
# ═══════════════════════════════════════════════


class TestUGCApplication:
    """Verify UGC creator application page."""

    def test_ugc_page_loads(self, page: Page, ugc_url: str):
        page.goto(ugc_url)
        expect(page).to_have_title(re.compile(r"UGC Creator"))

    def test_ugc_form_exists(self, page: Page, ugc_url: str):
        page.goto(ugc_url)
        form = page.locator("#ugcForm")
        assert form.count() == 1

    def test_ugc_has_required_fields(self, page: Page, ugc_url: str):
        page.goto(ugc_url)
        expect(page.locator('[name="name"]')).to_be_visible()
        expect(page.locator('[name="email"]')).to_be_visible()
        expect(page.locator('[name="instagram"]')).to_be_visible()
        expect(page.locator('[name="tiktok"]')).to_be_visible()

    def test_ugc_has_availability_field(self, page: Page, ugc_url: str):
        page.goto(ugc_url)
        expect(page.locator('[name="availability"]')).to_be_visible()

    def test_ugc_has_social_handles(self, page: Page, ugc_url: str):
        page.goto(ugc_url)
        expect(page.locator('[name="instagram"]')).to_be_visible()
        expect(page.locator('[name="tiktok"]')).to_be_visible()
        expect(page.locator('[name="youtube"]')).to_be_visible()
        expect(page.locator('[name="other_social"]')).to_be_visible()

    def test_ugc_has_niche_checkboxes(self, page: Page, ugc_url: str):
        page.goto(ugc_url)
        niches = page.locator('[name="niches"]')
        assert niches.count() == 8, f"Expected 8 niche checkboxes, got {niches.count()}"

    def test_ugc_no_rate_field(self, page: Page, ugc_url: str):
        """Rate field should have been removed."""
        page.goto(ugc_url)
        assert page.locator('[name="rate"]').count() == 0, "Rate field should not exist"

    def test_ugc_no_why_field(self, page: Page, ugc_url: str):
        """Why Vanta field should have been removed."""
        page.goto(ugc_url)
        assert page.locator('[name="whyVanta"]').count() == 0, "WhyVanta field should not exist"

    def test_ugc_validation_empty_name(self, page: Page, ugc_url: str):
        """Submitting without name should show error toast."""
        page.goto(ugc_url)
        page.fill('[name="email"]', "test@test.com")
        page.fill('[name="instagram"]', "@testcreator")
        page.click(".u-submit")
        page.wait_for_timeout(500)
        toast = page.locator("#ugcToast")
        expect(toast).to_have_css("opacity", "1")

    def test_ugc_validation_no_socials(self, page: Page, ugc_url: str):
        """Submitting without any social handles should show error toast."""
        page.goto(ugc_url)
        page.fill('[name="name"]', "Test Creator")
        page.fill('[name="email"]', "test@test.com")
        page.click(".u-submit")
        page.wait_for_timeout(500)
        toast = page.locator("#ugcToast")
        expect(toast).to_have_css("opacity", "1")

    def test_ugc_validation_bad_email(self, page: Page, ugc_url: str):
        """Submitting with invalid email should show error toast."""
        page.goto(ugc_url)
        page.fill('[name="name"]', "Test Creator")
        page.fill('[name="email"]', "not-an-email")
        page.fill('[name="instagram"]', "@testcreator")
        page.click(".u-submit")
        page.wait_for_timeout(500)
        toast = page.locator("#ugcToast")
        expect(toast).to_have_css("opacity", "1")

    def test_ugc_successful_submission(self, page: Page, ugc_url: str):
        """Valid submission should show success toast and save to localStorage."""
        page.goto(ugc_url)
        page.fill('[name="name"]', "Test Creator")
        page.fill('[name="email"]', "test@example.com")
        page.fill('[name="instagram"]', "@testcreator")
        page.fill('[name="tiktok"]', "@testcreator")
        page.select_option('[name="followers"]', "1k-5k")
        page.select_option('[name="experience"]', "1-5")
        page.select_option('[name="availability"]', "flexible")
        page.click(".u-submit")
        page.wait_for_timeout(1000)
        # Check toast shows success
        toast = page.locator("#ugcToast")
        expect(toast).to_have_css("opacity", "1")
        expect(toast).to_contain_text("submitted")
        # Verify localStorage
        stored = page.evaluate("JSON.parse(localStorage.getItem('vanta_ugc_applications') || '[]')")
        assert len(stored) > 0, "Expected submission in localStorage"
        assert stored[-1]["name"] == "Test Creator"

    def test_ugc_has_formspree_replyto(self, page: Page, ugc_url: str):
        """Submission data should include _replyto for Formspree auto-reply."""
        page.goto(ugc_url)
        page.fill('[name="name"]', "Reply Test")
        page.fill('[name="email"]', "reply@test.com")
        page.fill('[name="instagram"]', "@replytest")
        page.click(".u-submit")
        page.wait_for_timeout(1000)
        stored = page.evaluate("JSON.parse(localStorage.getItem('vanta_ugc_applications') || '[]')")
        last = stored[-1]
        assert last.get("_replyto") == "reply@test.com", "Should have _replyto for auto-confirmation"
        assert last.get("_subject") is not None, "Should have _subject for email"

    def test_ugc_footer_link_exists(self, page: Page, base_url: str):
        """UGC application link should exist in the main site footer."""
        page.goto(base_url)
        link = page.locator('a[href="ugc-apply.html"]')
        assert link.count() == 1, "Expected UGC link in footer"

    def test_ugc_waitlist_badge(self, page: Page, ugc_url: str):
        """Should show waitlist status badge."""
        page.goto(ugc_url)
        badge = page.locator(".u-status")
        expect(badge).to_be_visible()
        expect(badge).to_contain_text("Waitlist")
